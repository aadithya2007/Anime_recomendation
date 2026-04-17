import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function FollowPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [requests, setRequests] = useState([])
  const [actionError, setActionError] = useState('')

  const load = () => {
    api.get('/social/friends').then((res) => setFollowing(res.data || [])).catch(() => setFollowing([]))
    api.get('/social/followers').then((res) => setFollowers(res.data || [])).catch(() => setFollowers([]))
    api.get('/social/follow/requests').then((res) => setRequests(res.data || [])).catch(() => setRequests([]))
  }

  useEffect(() => {
    load()
  }, [])

  const searchUsers = async () => {
    if (!search.trim()) {
      setUsers([])
      return
    }
    const { data } = await api.get(`/social/users/search?username=${encodeURIComponent(search)}`)
    setUsers(data || [])
  }

  const follow = async (id) => {
    setActionError('')
    try {
      await api.post(`/social/follow/request/${id}`)
      load()
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Unable to send follow request.')
    }
  }

  const accept = async (requestId) => {
    setActionError('')
    try {
      await api.post(`/social/follow/accept/${requestId}`)
      load()
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Unable to accept follow request.')
    }
  }

  const unfollow = async (id) => {
    await api.delete(`/social/friends/${id}`)
    load()
  }

  return (
    <section className="fade-in profile-layout">
      <div className="card">
        <h2>Follow users</h2>
        <div className="profile-search-row insta-search">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username" />
          <button onClick={searchUsers}>Search</button>
        </div>
        {actionError && <p className="error">{actionError}</p>}

        <div className="stack">
          {users.map((u) => (
            <div className="follow-item" key={u.id}>
              <Link to={`/user/${u.id}`}>@{u.username}</Link>
              <button onClick={() => follow(u.id)}>Follow</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Follow requests</h3>
        <div className="stack">
          {requests.length === 0 && <p className="muted">No pending requests.</p>}
          {requests.map((r) => (
            <div className="follow-item" key={r.id}>
              <Link to={`/user/${r.requester?.id}`}>@{r.requester?.username}</Link>
              <button onClick={() => accept(r.id)}>Accept & Follow Back</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Followers</h3>
        <div className="stack">
          {followers.length === 0 && <p className="muted">No followers yet.</p>}
          {followers.map((u) => (
            <div className="follow-item" key={u.id}>
              <Link to={`/user/${u.id}`}>@{u.username}</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Following</h3>
        <div className="stack">
          {following.length === 0 && <p className="muted">You are not following anyone yet.</p>}
          {following.map((u) => (
            <div className="follow-item" key={u.id}>
              <Link to={`/user/${u.id}`}>@{u.username}</Link>
              <button className="danger" onClick={() => unfollow(u.id)}>Unfollow</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
