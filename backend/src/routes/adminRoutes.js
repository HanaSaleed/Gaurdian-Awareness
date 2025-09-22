import express from 'express';
import Employee from '../models/Employee.js';
import EduContent from '../models/EduContent.js';
import Quiz from '../models/Quiz.js';
import Template from '../models/Template.js';
import SimulationEvent from '../models/SimulationEvent.js';

const router = express.Router();

// Get admin dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    // Get employee count
    const totalEmployees = await Employee.countDocuments();
    
    // Get recent employees (last 5, sorted by creation date)
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();

    // Get active content count (published content)
    const activeContent = await EduContent.countDocuments({ status: 'published' });
    
    // Get recent content (last 5 published, sorted by publish date)
    const recentContent = await EduContent.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title publishedAt')
      .lean();

    // Get published quizzes count
    const publishedQuizzes = await Quiz.countDocuments({ status: 'published' });
    
    // Get phishing campaigns count (templates)
    const phishingCampaigns = await Template.countDocuments();
    
    // Get unique simulation names from events
    const uniqueSimulations = await SimulationEvent.distinct('simulationName');
    const activeSimulations = uniqueSimulations.length;

    // Calculate system health (simplified - could be more sophisticated)
    const systemHealth = 95; // Base health score

    // Format recent employees data
    const formattedRecentEmployees = recentEmployees.map(emp => ({
      name: emp.name,
      dept: emp.email.split('@')[1]?.split('.')[0] || 'Unknown',
      when: getTimeAgo(emp.createdAt)
    }));

    // Format recent content data
    const formattedRecentContent = recentContent.map(content => ({
      title: content.title,
      when: getTimeAgo(content.publishedAt || content.createdAt)
    }));

    const metrics = {
      totalEmployees,
      activeContent,
      publishedQuizzes,
      phishingCampaigns: activeSimulations,
      systemHealth,
      recent: {
        employees: formattedRecentEmployees,
        content: formattedRecentContent
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ 
      msg: 'Failed to fetch dashboard metrics', 
      error: error.message 
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

export default router;
