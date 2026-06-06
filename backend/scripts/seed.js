// backend/scripts/seed.js
// Run: node scripts/seed.js
// Seeds the database with sample AIRA content for testing

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const Admin        = require('../models/Admin');
const Blog         = require('../models/Blog');
const Project      = require('../models/Project');
const Announcement = require('../models/Announcement');
const Team         = require('../models/Team');
const Service      = require('../models/Service');
const About        = require('../models/About');

const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Blog.deleteMany(), Project.deleteMany(), Announcement.deleteMany(),
    Team.deleteMany(), Service.deleteMany(), About.deleteMany(),
  ]);
  console.log('🗑  Cleared existing data');

  // Admin
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    await Admin.create({ username: 'admin', password: 'aira2025', email: 'admin@airaworld.org', role: 'superadmin' });
    console.log('👤 Admin user created: admin / aira2025');
  }

  // About
  await About.create({
    _singleton: 'about',
    mission: 'To advance global health through rigorous data science, geospatial analytics, and evidence-based research — translating complex data into actionable public health solutions across Nepal and beyond.',
    history: [
      { year: '2018', title: 'AIRA Founded', desc: 'Established in Kathmandu with a focus on health informatics and disease surveillance.', ts: Date.now() },
      { year: '2020', title: 'First International Partnership', desc: 'Formed collaborations with WHO Nepal and global research institutions.', ts: Date.now() },
      { year: '2022', title: 'Digital Health Platform Launch', desc: 'Launched our live classroom and conference platform for capacity building.', ts: Date.now() },
      { year: '2024', title: 'Expanding Nationally', desc: 'Projects spanning all 7 provinces of Nepal with 50+ active research initiatives.', ts: Date.now() },
    ],
    missionCards: [
      { icon: '🔬', title: 'Research Excellence', desc: 'Rigorous, peer-reviewed health research that drives policy decisions.', ts: Date.now() },
      { icon: '🗺️', title: 'Geospatial Analysis', desc: 'GIS-powered disease mapping and spatial epidemiology for targeted interventions.', ts: Date.now() },
      { icon: '🎓', title: 'Capacity Building', desc: 'Training the next generation of health data scientists across South Asia.', ts: Date.now() },
    ],
    values: [
      { icon: '🌿', name: 'Evidence-Based', desc: 'Every recommendation grounded in rigorous data analysis and peer review.', ts: Date.now() },
      { icon: '🤝', name: 'Collaboration', desc: 'Partnering with government, NGOs, and academia for maximum impact.', ts: Date.now() },
      { icon: '💡', name: 'Innovation', desc: 'Pioneering digital health solutions tailored for low-resource settings.', ts: Date.now() },
      { icon: '🌍', name: 'Equity', desc: 'Ensuring health research benefits the most vulnerable populations.', ts: Date.now() },
    ],
  });

  // Team
  await Team.insertMany([
    { name: 'Dr. Rajendra Poudel', role: 'Executive Director', cat: 'leadership', bio: 'Public health expert with 15+ years in epidemiology and health informatics. PhD from Tribhuvan University. Former WHO Nepal consultant.', expertise: ['Epidemiology','GIS','Health Policy','Machine Learning'], order: 1, ts: Date.now() },
    { name: 'Dr. Sushma Karki', role: 'Research Director', cat: 'research', bio: 'Specialist in disease modeling and digital health innovation. Leading AIRA\'s flagship disease surveillance projects across 5 provinces.', expertise: ['Disease Modeling','R Programming','Spatial Analysis'], order: 2, ts: Date.now() },
    { name: 'Bikash Thapa', role: 'Data Science Lead', cat: 'research', bio: 'MSc in Data Science (India). Expert in Python, TensorFlow, and health data pipelines. Developed AIRA\'s automated disease alert system.', expertise: ['Python','TensorFlow','Data Engineering','NLP'], order: 3, ts: Date.now() },
    { name: 'Prof. Laxmi Devi Shrestha', role: 'Board Chairperson', cat: 'board', bio: 'Emeritus Professor of Public Health at Tribhuvan University. Pioneer in Nepal\'s national health information system development.', expertise: ['Public Health','Health Systems','Academia'], order: 1, ts: Date.now() },
  ]);

  // Services
  await Service.insertMany([
    { title: 'Health Data Analytics', icon: '📊', desc: 'Comprehensive analysis of health datasets using advanced statistical and machine learning methods to generate actionable insights.', features: ['Descriptive & inferential stats','Predictive modeling','Dashboard development','Custom reporting'], order: 1, ts: Date.now() },
    { title: 'GIS & Spatial Epidemiology', icon: '🗺️', desc: 'Geospatial mapping and disease burden analysis to identify hotspots, model transmission, and guide targeted interventions.', features: ['Disease burden mapping','Cluster detection','QGIS / ArcGIS workflows','Remote sensing'], order: 2, ts: Date.now() },
    { title: 'Disease Modeling', icon: '🦠', desc: 'Mathematical and computational models (SIR, SEIR, ABM) to simulate outbreak dynamics and evaluate intervention strategies.', features: ['Outbreak simulations','Vaccination impact analysis','Scenario forecasting','R & Python models'], order: 3, ts: Date.now() },
    { title: 'Digital Health Solutions', icon: '💻', desc: 'Custom web and mobile health information systems, electronic health records, and data collection tools for field deployments.', features: ['ODK / KoboToolbox','Custom dashboards','mHealth apps','API integrations'], order: 4, ts: Date.now() },
    { title: 'Capacity Building & Training', icon: '🎓', desc: 'Structured training programs in health informatics, data science, GIS, and research methodology for health professionals.', features: ['In-person & online workshops','Certificate courses','Mentorship programs','AIRA Live Classroom'], order: 5, ts: Date.now() },
    { title: 'Research & Consultancy', icon: '🔬', desc: 'End-to-end research support including study design, data collection, analysis, writing, and dissemination for public health projects.', features: ['Protocol development','Ethics submission support','Manuscript writing','Policy briefs'], order: 6, ts: Date.now() },
  ]);

  // Blogs
  await Blog.insertMany([
    { title: 'Spatial Epidemiology of Dengue Fever in the Terai Region', author: 'Dr. Sushma Karki', cat: 'research', emoji: '🦟', status: 'published', excerpt: 'A comprehensive GIS-based analysis of dengue transmission patterns across Nepal\'s lowland districts from 2019–2023, revealing key environmental and socioeconomic drivers.', content: 'Full article content here...', tags: ['GIS','Dengue','Epidemiology','Nepal'], date: dateStr(), ts: Date.now() },
    { title: 'Machine Learning for Early Disease Outbreak Detection', author: 'Bikash Thapa', cat: 'tech', emoji: '🤖', status: 'published', excerpt: 'How AIRA\'s random forest classifier achieved 89% accuracy in predicting district-level disease outbreaks 2 weeks in advance using syndromic surveillance data.', tags: ['Machine Learning','Surveillance','Python'], date: dateStr(), ts: Date.now() },
    { title: 'Nepal\'s Journey Toward Universal Health Coverage: Data Perspectives', author: 'Dr. Rajendra Poudel', cat: 'policy', emoji: '🏥', status: 'published', excerpt: 'Analysis of HMIS data over a decade reveals progress and persistent gaps in essential health service coverage across Nepal\'s 77 districts.', tags: ['UHC','Health Policy','HMIS','Nepal'], date: dateStr(), ts: Date.now() },
  ]);

  // Projects
  await Project.insertMany([
    { title: 'National Disease Surveillance Enhancement Project', pstatus: 'current', emoji: '🦠', desc: 'Strengthening Nepal\'s Integrated Disease Surveillance and Response (IDSR) system through digital tools, real-time dashboards, and capacity building in all 7 provinces.', method: 'Mixed methods: quantitative surveillance data + qualitative stakeholder interviews', timeline: '2023–2025', partners: 'Ministry of Health Nepal, WHO, USAID', impact: '500+ health workers trained, 77 districts covered', achievements: ['Deployed real-time disease dashboard in 7 provincial health offices', 'Trained 500 surveillance officers on digital reporting'], tags: ['Surveillance','Digital Health','Nepal'], date: dateStr(), ts: Date.now() },
    { title: 'GIS-Powered Malaria Elimination Mapping — Koshi Province', pstatus: 'current', emoji: '🗺️', desc: 'High-resolution geospatial risk stratification of malaria transmission zones to guide targeted indoor residual spraying and bed net distribution campaigns.', method: 'Spatial analysis using QGIS, remote sensing (NDVI, land use), and entomological surveys', timeline: '2024–2026', partners: 'EDCD Nepal, PMI', tags: ['GIS','Malaria','Koshi Province'], date: dateStr(), ts: Date.now() },
    { title: 'Health Information System Evaluation — Lumbini Province', pstatus: 'past', emoji: '📊', desc: 'Comprehensive evaluation of the DHIS2-based health information system across 12 districts, identifying data quality gaps and recommending structural improvements.', method: 'Data quality assessment, system audit, focus group discussions', timeline: '2021–2022', impact: 'DHIS2 data completeness improved from 67% to 91%', tags: ['DHIS2','HIS','Evaluation'], date: dateStr(), ts: Date.now() },
  ]);

  // Announcements
  await Announcement.insertMany([
    { title: 'AIRA Fellowship Program 2025 — Applications Open', priority: 'important', atype: 'vacancy', date: dateStr(), content: 'AIRA is inviting applications for its annual Research Fellowship Program. Fellowships are available in Health Informatics, GIS, and Data Science. Duration: 6 months. Stipend provided. Deadline: 31 July 2025.', link: '#', ts: Date.now() },
    { title: 'Workshop: Introduction to R for Public Health Researchers', priority: 'normal', atype: 'training', date: dateStr(), content: 'A 3-day intensive workshop on R programming for health data analysis. Topics: data wrangling with tidyverse, visualization with ggplot2, and regression modeling. Venue: AIRA Training Center, Kathmandu.', ts: Date.now() },
    { title: 'AIRA Research Publication in The Lancet Regional Health', priority: 'important', atype: 'publication', date: dateStr(), content: 'AIRA\'s study on subnational disease burden estimation in Nepal has been accepted for publication in The Lancet Regional Health — Southeast Asia. This marks AIRA\'s first high-impact journal publication.', ts: Date.now() },
  ]);

  console.log('🌱 Seed data inserted successfully!');
  console.log('\n── Admin Login ──────────────────────');
  console.log('  Username: admin');
  console.log('  Password: aira2025');
  console.log('  ⚠️  Change the password immediately after first login!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
