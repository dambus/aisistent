create or replace view v_cetvrtak_kandidati as
select ci.id, ci.keyword, ci.naslov, ci.alat, ci.cluster, ci.blog_post_id, ci.created_at,
       bp.published as blog_published, bp.slug as blog_slug, bp.title as blog_title
from content_items ci
join blog_posts bp on bp.id = ci.blog_post_id
where ci.blog_post_id is not null
  and ci.linkedin_copy is null;