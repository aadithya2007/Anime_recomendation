# AnimeFlix (AniReco)

## Upgraded features
- Hero with gradient overlay + fade text animation + hover zoom.
- Top-5 carousel with arrows, auto-rotate every 5s, and pause on hover.
- Wishlist toggle buttons on anime cards (Add/Remove).
- Profile dropdown with animated open/close + outside click close.
- Notification bell with backend notification count.
- Follow page with user search, follow requests, accept/follow-back, and unfollow.
- Public user profile route: `/user/:id`.
- Review cards include reviewer name, like, comment UI.
- Custom favicon configured.

## Backend API (required routes)
- `GET /api/notifications`
- `POST /api/follow/request/{id}`
- `POST /api/follow/accept/{id}`
- `POST /api/follow/accept-followback/{id}`
- `GET /api/user/{id}`
- `GET /api/user/{id}/wishlist`
- `POST /api/list/add/{id}`
- `DELETE /api/list/remove/{id}`

## Run
```bash
cd backend && mvn spring-boot:run
cd frontend && npm install && npm run dev
```

Optional frontend API base URL:
```bash
VITE_API_BASE_URL=http://localhost:8083/api
```
