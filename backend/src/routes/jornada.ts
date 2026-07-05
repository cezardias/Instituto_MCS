import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// GET /api/jornada - Fetch the gamified assessments (Missions) ordered by journey_order
router.get('/', authMiddleware, (req, res) => {
  const tenant_id = (req as any).user.tenant_id
  const user = (req as any).user

  try {
    // Get all gamified assessments
    const missions = db.prepare(`
      SELECT * FROM assessments 
      WHERE tenant_id = ? AND is_gamified = 1
      ORDER BY journey_order ASC, id ASC
    `).all(tenant_id)

    // Get the user's completed deliveries to know which missions are done
    const deliveries = db.prepare(`
      SELECT assessment_id FROM assessment_deliveries 
      WHERE student_id = ?
    `).all(user.id)
    
    const completedIds = new Set(deliveries.map((d: any) => d.assessment_id))

    // Determine status for each mission (completed, current, locked)
    let foundCurrent = false
    const trail = missions.map((m: any) => {
      const isCompleted = completedIds.has(m.id)
      let status = 'locked'
      
      if (isCompleted) {
        status = 'completed'
      } else if (!foundCurrent) {
        status = 'current'
        foundCurrent = true
      }

      // Fetch questions if status is current so the frontend can render the lesson
      let questions = []
      if (status === 'current') {
        const qList = db.prepare(`SELECT * FROM assessment_questions WHERE assessment_id = ?`).all(m.id)
        questions = qList.map((q: any) => ({
          ...q,
          options: q.options_json ? JSON.parse(q.options_json) : []
        }))
      }

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        journey_order: m.journey_order,
        status,
        questions
      }
    })

    res.json(trail)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
