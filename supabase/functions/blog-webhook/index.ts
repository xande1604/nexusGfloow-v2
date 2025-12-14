import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Convert plain text to HTML with proper formatting
function textToHtml(text: string): string {
  if (!text) return '';
  
  // Check if content is already HTML
  if (text.trim().startsWith('<') && (text.includes('</p>') || text.includes('</div>') || text.includes('</h'))) {
    return text;
  }
  
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  let currentListType = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (!line) {
      // Close any open list
      if (inList) {
        html += currentListType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      continue;
    }
    
    // Check for headers (lines ending with :)
    if (line.endsWith(':') && line.length < 100 && !line.startsWith('-') && !line.startsWith('•')) {
      if (inList) {
        html += currentListType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      const headerText = line.slice(0, -1);
      html += `<h2 class="text-xl font-semibold mt-8 mb-4">${headerText}</h2>`;
      continue;
    }
    
    // Check for bullet points
    const bulletMatch = line.match(/^[-•]\s*(.+)/);
    const numberedMatch = line.match(/^\d+[.)]\s*(.+)/);
    
    if (bulletMatch) {
      if (!inList || currentListType !== 'ul') {
        if (inList) html += '</ol>';
        html += '<ul class="list-disc pl-6 mb-4 space-y-2">';
        inList = true;
        currentListType = 'ul';
      }
      html += `<li>${bulletMatch[1]}</li>`;
      continue;
    }
    
    if (numberedMatch) {
      if (!inList || currentListType !== 'ol') {
        if (inList) html += '</ul>';
        html += '<ol class="list-decimal pl-6 mb-4 space-y-2">';
        inList = true;
        currentListType = 'ol';
      }
      html += `<li>${numberedMatch[1]}</li>`;
      continue;
    }
    
    // Check for indented content (sub-items)
    if (line.startsWith('   ') || line.startsWith('\t')) {
      const trimmedLine = line.trim();
      const subBulletMatch = trimmedLine.match(/^[-•]\s*(.+)/);
      
      if (subBulletMatch) {
        if (!inList) {
          html += '<ul class="list-disc pl-6 mb-4 space-y-2">';
          inList = true;
          currentListType = 'ul';
        }
        html += `<li>${subBulletMatch[1]}</li>`;
        continue;
      }
    }
    
    // Close any open list before adding paragraph
    if (inList) {
      html += currentListType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
    }
    
    // Regular paragraph
    html += `<p class="mb-4 leading-relaxed">${line}</p>`;
  }
  
  // Close any remaining open list
  if (inList) {
    html += currentListType === 'ul' ? '</ul>' : '</ol>';
  }
  
  return html;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get authorization token from header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.error('No authorization token provided');
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate webhook token
    const { data: tokenData, error: tokenError } = await supabase
      .from('blog_webhook_tokens')
      .select('id, is_active, owner_admin_id')
      .eq('token', token)
      .single();
    
    if (tokenError || !tokenData) {
      console.error('Invalid token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!tokenData.is_active) {
      console.error('Token is inactive');
      return new Response(
        JSON.stringify({ error: 'Token is inactive' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update last_used_at
    await supabase
      .from('blog_webhook_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenData.id);
    
    // Parse request body
    const body = await req.json();
    console.log('Received blog post data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    const { title, slug, content, author } = body;
    
    if (!title || !slug || !content) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['title', 'slug', 'content'],
          received: { title: !!title, slug: !!slug, content: !!content }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Convert content to HTML if it's plain text
    const htmlContent = textToHtml(content);
    console.log('Converted content to HTML');
    
    // Handle cover image - accept both cover_image and image_url field names
    let coverImageUrl = body.cover_image || body.image_url || body.image || null;
    console.log('Cover image received:', coverImageUrl ? 'yes' : 'no');
    
    // If cover_image is a base64 string, we could store it (for now, just use URL)
    if (coverImageUrl && coverImageUrl.startsWith('data:')) {
      console.log('Base64 image detected - storing as-is');
      // For base64 images, keep them as-is (they work in img src)
    } else if (coverImageUrl) {
      // Validate URL format
      try {
        new URL(coverImageUrl);
        console.log('Valid cover image URL:', coverImageUrl);
      } catch {
        console.warn('Invalid cover image URL format, setting to null');
        coverImageUrl = null;
      }
    }
    
    // Prepare blog post data
    const postData = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      content: htmlContent,
      author: author?.trim() || 'GFloow',
      excerpt: body.excerpt?.trim() || null,
      cover_image: coverImageUrl,
      status: body.status || 'published',
      published_at: body.published_at || new Date().toISOString(),
      scheduled_at: body.scheduled_at || null,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : null),
      seo_title: body.seo_title?.trim() || null,
      meta_description: body.meta_description?.trim() || null,
      meta_keywords: body.meta_keywords?.trim() || null,
      og_image: body.og_image || coverImageUrl,
      canonical_url: body.canonical_url || null,
      owner_admin_id: tokenData.owner_admin_id,
    };
    
    console.log('Inserting blog post:', postData.title);
    
    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postData.slug)
      .single();
    
    let result;
    
    if (existingPost) {
      // Update existing post
      console.log('Updating existing post with slug:', postData.slug);
      result = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('slug', postData.slug)
        .select()
        .single();
    } else {
      // Insert new post
      console.log('Creating new post with slug:', postData.slug);
      result = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: 'Failed to save blog post', details: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Blog post saved successfully:', result.data.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: existingPost ? 'Blog post updated' : 'Blog post created',
        post: {
          id: result.data.id,
          slug: result.data.slug,
          title: result.data.title,
          status: result.data.status,
          url: `/blog/${result.data.slug}`
        }
      }),
      { status: existingPost ? 200 : 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
