# Architecture Decisions

- Keep all content routes inside the shared editorial Layout so navigation and visual identity remain consistent across live Trello views.
- Keep Trello ingestion and query hooks separate from presentation components so visual redesigns do not alter data behavior.
- Scope homepage visual overrides to the community-home container and reference uploaded artwork through CDN asset pointers so other content pages and data behavior remain unchanged.
- Keep uploaded unit-artwork matching in a shared presentation-only registry; match unit titles rather than descriptions or list names to avoid assigning banners to unrelated procedural records.
- Keep career matching, law classification/citation, and Roman calendar calculations in tested pure helpers so live records and date rules can be verified independently of presentation.