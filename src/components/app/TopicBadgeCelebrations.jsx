import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import CompleteSuccessModal from './CompleteSuccessModal'
import { dismissBadge, pendingBadges } from '../../services/completionRewardsService'

export default function TopicBadgeCelebrations({ userId, classroomId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [awards, setAwards] = useState(() => [...new Map([...pendingBadges(userId, classroomId), ...(location.state?.badgeAwards ?? [])].map(award => [award.id, award])).values()])
  const [open, setOpen] = useState(true)
  const award = awards[0]
  if (!award) return null
  const dismiss = () => {
    setOpen(false)
    dismissBadge(userId, classroomId, award.id)
    navigate(location.pathname, { replace: true, state: { ...location.state, badgeAwards: awards.slice(1) } })
    setTimeout(() => { setAwards(items => items.slice(1)); setOpen(true) }, 250)
  }
  return <CompleteSuccessModal key={award.id} isOpen={open} badge={award} onExit={dismiss} />
}
