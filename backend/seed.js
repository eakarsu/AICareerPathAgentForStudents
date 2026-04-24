const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting database seed...');

  // Create tables
  await pool.query(`
    DROP TABLE IF EXISTS assessments, portfolios, resumes, networking_events, scholarships,
    mentors, interview_questions, job_trends, courses, skills, career_paths,
    learning_roadmaps, industry_insights, salary_insights, users CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE career_paths (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      industry VARCHAR(255),
      avg_salary VARCHAR(100),
      growth_rate VARCHAR(50),
      education_required VARCHAR(255),
      skills TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE skills (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      description TEXT,
      difficulty_level VARCHAR(50),
      demand_level VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      provider VARCHAR(255),
      description TEXT,
      duration VARCHAR(100),
      level VARCHAR(50),
      url TEXT,
      career_path_id INTEGER REFERENCES career_paths(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE job_trends (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      industry VARCHAR(255),
      demand_level VARCHAR(50),
      growth_percentage VARCHAR(50),
      avg_salary VARCHAR(100),
      location VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE interview_questions (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      category VARCHAR(255),
      difficulty VARCHAR(50),
      career_path VARCHAR(255),
      sample_answer TEXT,
      tips TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE mentors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      company VARCHAR(255),
      industry VARCHAR(255),
      expertise TEXT,
      bio TEXT,
      availability VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE scholarships (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(255),
      amount VARCHAR(100),
      deadline VARCHAR(100),
      eligibility TEXT,
      description TEXT,
      url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE networking_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      event_date VARCHAR(100),
      location VARCHAR(255),
      event_type VARCHAR(100),
      description TEXT,
      industry VARCHAR(255),
      url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE resumes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      content TEXT,
      target_role VARCHAR(255),
      experience_level VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE portfolios (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      description TEXT,
      projects TEXT,
      skills_showcased TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE learning_roadmaps (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      career_path VARCHAR(255),
      steps TEXT,
      duration VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE industry_insights (
      id SERIAL PRIMARY KEY,
      industry VARCHAR(255) NOT NULL,
      overview TEXT,
      trends TEXT,
      top_companies TEXT,
      challenges TEXT,
      opportunities TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE salary_insights (
      id SERIAL PRIMARY KEY,
      role VARCHAR(255) NOT NULL,
      industry VARCHAR(255),
      entry_level VARCHAR(100),
      mid_level VARCHAR(100),
      senior_level VARCHAR(100),
      location VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE assessments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      assessment_type VARCHAR(100),
      questions TEXT,
      results TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tables created.');

  // Seed demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  await pool.query(
    "INSERT INTO users (name, email, password) VALUES ('Demo Student', 'demo@student.com', $1)",
    [hashedPassword]
  );
  console.log('Demo user created: demo@student.com / demo123');

  // Seed Career Paths (15+)
  const careerPaths = [
    ['Software Engineer', 'Design, develop, and maintain software applications. Work with teams to build scalable solutions using modern technologies.', 'Technology', '$85,000 - $165,000', '25%', "Bachelor's in CS or related", 'JavaScript, Python, System Design, Cloud Computing, Git'],
    ['Data Scientist', 'Analyze complex datasets to extract insights and build predictive models. Bridge the gap between data and business decisions.', 'Technology', '$95,000 - $155,000', '36%', "Master's preferred in Statistics/CS", 'Python, R, Machine Learning, SQL, Statistics'],
    ['UX/UI Designer', 'Create intuitive and beautiful user interfaces. Conduct user research and design experiences that delight users.', 'Design', '$70,000 - $130,000', '13%', "Bachelor's in Design/HCI", 'Figma, User Research, Prototyping, Design Systems, CSS'],
    ['Product Manager', 'Lead product strategy and execution. Work cross-functionally to deliver products that solve real user problems.', 'Business', '$90,000 - $170,000', '10%', "Bachelor's in Business/Engineering", 'Strategy, Analytics, Communication, Agile, User Research'],
    ['Cybersecurity Analyst', 'Protect organizations from cyber threats. Monitor networks, investigate breaches, and implement security measures.', 'Technology', '$80,000 - $145,000', '33%', "Bachelor's in CS/Cybersecurity", 'Network Security, SIEM, Penetration Testing, Risk Assessment'],
    ['Machine Learning Engineer', 'Build and deploy ML models at scale. Bridge research and production to create intelligent systems.', 'AI/ML', '$110,000 - $200,000', '40%', "Master's/PhD in CS/ML", 'TensorFlow, PyTorch, Python, MLOps, Mathematics'],
    ['Cloud Architect', 'Design and manage cloud infrastructure. Ensure scalability, reliability, and cost-efficiency of cloud systems.', 'Technology', '$120,000 - $190,000', '28%', "Bachelor's + certifications", 'AWS, Azure, GCP, Kubernetes, Terraform'],
    ['Digital Marketing Specialist', 'Create and execute digital marketing strategies. Drive growth through SEO, social media, and content marketing.', 'Marketing', '$55,000 - $95,000', '10%', "Bachelor's in Marketing", 'SEO, Google Analytics, Social Media, Content Strategy, PPC'],
    ['Financial Analyst', 'Analyze financial data and market trends. Provide insights for investment decisions and business strategy.', 'Finance', '$65,000 - $120,000', '9%', "Bachelor's in Finance/Economics", 'Financial Modeling, Excel, SQL, Bloomberg Terminal, Accounting'],
    ['Biomedical Engineer', 'Design medical devices and healthcare solutions. Combine engineering with biology to improve patient care.', 'Healthcare', '$75,000 - $135,000', '6%', "Master's in Biomedical Engineering", 'CAD, MATLAB, Regulatory Compliance, Biology, Signal Processing'],
    ['Environmental Scientist', 'Study environmental problems and develop solutions. Work on sustainability, conservation, and climate change.', 'Environmental', '$60,000 - $105,000', '8%', "Bachelor's/Master's in Environmental Science", 'GIS, Data Analysis, Environmental Law, Field Research'],
    ['Robotics Engineer', 'Design and build robots and automated systems. Work at the intersection of mechanical, electrical, and software engineering.', 'Engineering', '$85,000 - $155,000', '22%', "Master's in Robotics/ME/EE", 'ROS, C++, Python, Control Systems, Computer Vision'],
    ['Healthcare Administrator', 'Manage healthcare facilities and services. Improve healthcare delivery through operational excellence.', 'Healthcare', '$70,000 - $130,000', '28%', "Master's in Healthcare Admin", 'Healthcare Policy, Operations, Leadership, EHR Systems'],
    ['Blockchain Developer', 'Build decentralized applications and smart contracts. Work on Web3 technologies and cryptocurrency platforms.', 'Technology', '$100,000 - $180,000', '30%', "Bachelor's in CS", 'Solidity, Web3.js, Smart Contracts, Cryptography, DeFi'],
    ['AI Ethics Researcher', 'Study ethical implications of AI systems. Develop frameworks for responsible AI development and deployment.', 'AI/ML', '$90,000 - $160,000', '35%', "PhD in Ethics/CS/Philosophy", 'AI/ML Concepts, Policy Analysis, Research, Philosophy, Communication'],
    ['DevOps Engineer', 'Bridge development and operations. Automate deployment pipelines and ensure system reliability.', 'Technology', '$95,000 - $160,000', '20%', "Bachelor's in CS/IT", 'Docker, Kubernetes, CI/CD, Linux, Python, Monitoring']
  ];
  for (const cp of careerPaths) {
    await pool.query(
      'INSERT INTO career_paths (title, description, industry, avg_salary, growth_rate, education_required, skills) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      cp
    );
  }
  console.log('Career paths seeded.');

  // Seed Skills (15+)
  const skillsData = [
    ['Python Programming', 'Programming', 'Versatile programming language used in web development, data science, AI, and automation.', 'Beginner-Intermediate', 'Very High'],
    ['JavaScript', 'Programming', 'Essential language for web development, both frontend and backend with Node.js.', 'Beginner-Intermediate', 'Very High'],
    ['Machine Learning', 'AI/ML', 'Building systems that learn from data to make predictions and decisions.', 'Advanced', 'Very High'],
    ['Cloud Computing (AWS)', 'Infrastructure', 'Building and managing applications on Amazon Web Services cloud platform.', 'Intermediate', 'Very High'],
    ['Data Analysis', 'Analytics', 'Extracting insights from data using statistical methods and visualization tools.', 'Beginner-Intermediate', 'High'],
    ['React.js', 'Frontend', 'Popular JavaScript library for building modern user interfaces and single-page applications.', 'Intermediate', 'Very High'],
    ['SQL & Database Management', 'Data', 'Managing and querying relational databases for data storage and retrieval.', 'Beginner', 'High'],
    ['Project Management', 'Business', 'Planning, executing, and closing projects. Includes Agile and Scrum methodologies.', 'Intermediate', 'High'],
    ['UI/UX Design', 'Design', 'Creating user-centered designs that are both functional and aesthetically pleasing.', 'Intermediate', 'High'],
    ['Cybersecurity Fundamentals', 'Security', 'Understanding threats, vulnerabilities, and protective measures for digital systems.', 'Intermediate', 'Very High'],
    ['Communication & Presentation', 'Soft Skills', 'Effectively conveying ideas through written and verbal communication.', 'Beginner', 'Very High'],
    ['Git & Version Control', 'DevOps', 'Managing code changes and collaboration using Git and platforms like GitHub.', 'Beginner', 'High'],
    ['Docker & Containerization', 'DevOps', 'Packaging applications into containers for consistent deployment across environments.', 'Intermediate', 'High'],
    ['Natural Language Processing', 'AI/ML', 'Building systems that understand and generate human language.', 'Advanced', 'Very High'],
    ['Blockchain Development', 'Web3', 'Creating decentralized applications and smart contracts on blockchain platforms.', 'Advanced', 'High'],
    ['Statistical Analysis', 'Analytics', 'Applying statistical methods to analyze and interpret data for decision-making.', 'Intermediate', 'High']
  ];
  for (const s of skillsData) {
    await pool.query(
      'INSERT INTO skills (name, category, description, difficulty_level, demand_level) VALUES ($1,$2,$3,$4,$5)',
      s
    );
  }
  console.log('Skills seeded.');

  // Seed Courses (15+)
  const coursesData = [
    ['CS50: Introduction to Computer Science', 'Harvard/edX', 'World-renowned intro to CS covering C, Python, SQL, and web development.', '12 weeks', 'Beginner', 'https://cs50.harvard.edu', 1],
    ['Machine Learning Specialization', 'Stanford/Coursera', 'Andrew Ng comprehensive ML course covering supervised/unsupervised learning.', '3 months', 'Intermediate', 'https://coursera.org/ml', 2],
    ['Google UX Design Certificate', 'Google/Coursera', 'Professional certificate in UX design with hands-on portfolio projects.', '6 months', 'Beginner', 'https://coursera.org/google-ux', 3],
    ['AWS Solutions Architect', 'AWS', 'Prepare for AWS Solutions Architect certification with hands-on labs.', '3 months', 'Intermediate', 'https://aws.training', 7],
    ['Full-Stack Web Development', 'Meta/Coursera', 'Complete web development bootcamp covering React, Node.js, and databases.', '7 months', 'Beginner', 'https://coursera.org/meta-fullstack', 1],
    ['Data Science with Python', 'IBM/Coursera', 'Comprehensive data science program covering Python, SQL, and visualization.', '5 months', 'Beginner', 'https://coursera.org/ibm-ds', 2],
    ['Cybersecurity Specialization', 'University of Maryland/Coursera', 'Covers network security, cryptography, and security operations.', '5 months', 'Intermediate', 'https://coursera.org/cybersec', 5],
    ['Product Management Fundamentals', 'Pragmatic Institute', 'Learn product strategy, market analysis, and agile product development.', '8 weeks', 'Beginner', 'https://pragmaticinstitute.com', 4],
    ['Deep Learning Specialization', 'DeepLearning.AI/Coursera', 'Five-course series on neural networks, CNNs, RNNs, and transformers.', '4 months', 'Advanced', 'https://coursera.org/deep-learning', 6],
    ['Digital Marketing & E-commerce', 'Google/Coursera', 'Google professional certificate in digital marketing fundamentals.', '6 months', 'Beginner', 'https://coursera.org/google-dm', 8],
    ['Financial Markets', 'Yale/Coursera', 'Nobel laureate Robert Shiller teaches financial markets and risk management.', '7 weeks', 'Beginner', 'https://coursera.org/financial-markets', 9],
    ['Blockchain Specialization', 'University at Buffalo/Coursera', 'Learn blockchain fundamentals, smart contracts, and dApp development.', '4 months', 'Intermediate', 'https://coursera.org/blockchain', 14],
    ['Kubernetes for Developers', 'Linux Foundation/edX', 'Learn to deploy, manage, and scale containerized applications with K8s.', '5 weeks', 'Intermediate', 'https://edx.org/k8s', 16],
    ['AI Ethics', 'University of Helsinki', 'Free course on ethical considerations in AI development and deployment.', '4 weeks', 'Beginner', 'https://ethics-of-ai.mooc.fi', 15],
    ['Biomedical Engineering Fundamentals', 'Johns Hopkins/Coursera', 'Introduction to biomedical engineering concepts and applications.', '8 weeks', 'Beginner', 'https://coursera.org/bme', 10],
    ['Environmental Science & Sustainability', 'SDG Academy/edX', 'Covers global environmental challenges and sustainable development.', '10 weeks', 'Beginner', 'https://edx.org/env-sci', 11]
  ];
  for (const c of coursesData) {
    await pool.query(
      'INSERT INTO courses (title, provider, description, duration, level, url, career_path_id) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      c
    );
  }
  console.log('Courses seeded.');

  // Seed Job Trends (15+)
  const jobTrendsData = [
    ['AI/ML Engineer', 'Technology', 'Very High', '40%', '$130,000 - $200,000', 'San Francisco, Remote', 'Explosive demand driven by generative AI boom. Companies across all sectors hiring ML talent.'],
    ['Full-Stack Developer', 'Technology', 'Very High', '25%', '$85,000 - $155,000', 'Nationwide, Remote', 'Consistently strong demand for developers who can work across the entire stack.'],
    ['Data Engineer', 'Technology', 'Very High', '30%', '$100,000 - $170,000', 'Nationwide', 'Growing need for professionals who can build and maintain data pipelines.'],
    ['Cloud Security Engineer', 'Cybersecurity', 'Very High', '35%', '$120,000 - $185,000', 'Nationwide, Remote', 'Critical demand as organizations migrate to cloud and face increasing threats.'],
    ['Product Designer', 'Design', 'High', '15%', '$90,000 - $150,000', 'Major Tech Hubs', 'Growing emphasis on user experience driving demand for skilled designers.'],
    ['DevOps/SRE', 'Technology', 'Very High', '22%', '$110,000 - $175,000', 'Nationwide, Remote', 'Essential role for maintaining reliability and deployment velocity.'],
    ['Healthcare Data Analyst', 'Healthcare', 'High', '28%', '$65,000 - $110,000', 'Nationwide', 'Healthcare digitization creating demand for data-savvy professionals.'],
    ['Sustainability Consultant', 'Environmental', 'High', '18%', '$60,000 - $120,000', 'Major Cities', 'ESG mandates and climate goals driving corporate sustainability hiring.'],
    ['Prompt Engineer', 'AI/ML', 'High', '45%', '$80,000 - $150,000', 'Remote', 'New role emerging from generative AI adoption across industries.'],
    ['Blockchain Developer', 'Finance/Tech', 'Moderate', '20%', '$100,000 - $175,000', 'Remote, NYC, SF', 'Steady demand in DeFi, enterprise blockchain, and Web3 applications.'],
    ['Robotics Software Engineer', 'Manufacturing', 'High', '22%', '$95,000 - $160,000', 'Detroit, Boston, SF', 'Automation and autonomous systems driving robotics talent demand.'],
    ['UX Researcher', 'Technology', 'High', '12%', '$80,000 - $140,000', 'Major Tech Hubs', 'Increasing focus on user-centered design requires dedicated researchers.'],
    ['Quantum Computing Researcher', 'Technology', 'Moderate', '30%', '$120,000 - $200,000', 'Research Hubs', 'Emerging field with growing investment from tech giants and governments.'],
    ['EdTech Specialist', 'Education', 'High', '15%', '$55,000 - $95,000', 'Remote, Urban', 'Digital transformation of education creating new tech-education roles.'],
    ['FinTech Developer', 'Finance', 'Very High', '25%', '$95,000 - $170,000', 'NYC, SF, London', 'Financial innovation and digital banking driving strong developer demand.'],
    ['Climate Tech Engineer', 'Environmental', 'High', '32%', '$80,000 - $150,000', 'Nationwide', 'Growing investment in climate technology creating new engineering roles.']
  ];
  for (const jt of jobTrendsData) {
    await pool.query(
      'INSERT INTO job_trends (title, industry, demand_level, growth_percentage, avg_salary, location, description) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      jt
    );
  }
  console.log('Job trends seeded.');

  // Seed Interview Questions (15+)
  const interviewData = [
    ['Tell me about yourself and why you chose this career path.', 'Behavioral', 'Easy', 'General', 'I am a [year] student at [university] studying [field]. I became passionate about [area] when [story]. I have developed skills in [skills] through [experiences]. I am excited about this opportunity because [reason].', 'Keep it under 2 minutes. Focus on relevant experiences and enthusiasm.'],
    ['Describe a challenging project you worked on. How did you handle it?', 'Behavioral', 'Medium', 'General', 'Use the STAR method: Describe the Situation, Task you were assigned, Actions you took, and the Results achieved. Be specific about your contribution.', 'Prepare 3-4 STAR stories that highlight different skills.'],
    ['What is the difference between supervised and unsupervised learning?', 'Technical', 'Medium', 'Data Science', 'Supervised learning uses labeled data to train models (classification, regression). Unsupervised learning finds patterns in unlabeled data (clustering, dimensionality reduction).', 'Give real-world examples for each type.'],
    ['How would you design a URL shortener system?', 'System Design', 'Hard', 'Software Engineering', 'Discuss: hash generation, database schema, redirect mechanism, scalability (caching, sharding), analytics tracking, and handling collisions.', 'Start with requirements, then design step by step.'],
    ['Explain the concept of RESTful APIs.', 'Technical', 'Easy', 'Software Engineering', 'REST is an architectural style using HTTP methods (GET, POST, PUT, DELETE) for CRUD operations. Key principles: stateless, resource-based URLs, standard HTTP status codes.', 'Mention real examples you have built.'],
    ['How do you prioritize features in a product backlog?', 'Product', 'Medium', 'Product Management', 'Use frameworks like RICE (Reach, Impact, Confidence, Effort), MoSCoW, or value vs. effort matrices. Consider user impact, business goals, and technical feasibility.', 'Reference specific frameworks and give examples.'],
    ['What is your approach to user research?', 'Design', 'Medium', 'UX Design', 'Start with defining research goals, choose methods (interviews, surveys, usability tests), recruit participants, conduct research, synthesize findings into actionable insights.', 'Mention both qualitative and quantitative methods.'],
    ['Explain the CIA triad in cybersecurity.', 'Technical', 'Easy', 'Cybersecurity', 'CIA stands for Confidentiality (protecting data access), Integrity (ensuring data accuracy), and Availability (ensuring system uptime). These are the three pillars of information security.', 'Give examples of threats to each principle.'],
    ['How would you handle a disagreement with a team member?', 'Behavioral', 'Medium', 'General', 'Listen to understand their perspective, find common ground, use data to support decisions, escalate constructively if needed. Focus on the problem, not the person.', 'Show emotional intelligence and collaboration skills.'],
    ['What is Big O notation and why does it matter?', 'Technical', 'Medium', 'Software Engineering', 'Big O describes algorithm time/space complexity as input grows. Common complexities: O(1), O(log n), O(n), O(n log n), O(n²). It helps choose efficient algorithms.', 'Be ready to analyze complexity of your code.'],
    ['Describe a time you failed and what you learned.', 'Behavioral', 'Medium', 'General', 'Be honest about a real failure. Explain what happened, what you learned, and how you applied that lesson going forward. Show growth mindset.', 'Choose a meaningful failure that led to real growth.'],
    ['How would you explain machine learning to a non-technical person?', 'Communication', 'Easy', 'Data Science', 'ML is like teaching a computer to learn from examples. Instead of programming exact rules, you show it many examples and it figures out patterns, like how a child learns to recognize cats by seeing many pictures of cats.', 'Use relatable analogies and avoid jargon.'],
    ['What metrics would you track for a social media app?', 'Product', 'Medium', 'Product Management', 'DAU/MAU ratio, time spent, engagement rate, retention curves, NPS, virality coefficient, revenue per user. Align metrics with business goals and user value.', 'Distinguish between vanity metrics and actionable ones.'],
    ['Walk me through your design process.', 'Design', 'Easy', 'UX Design', 'Research → Define → Ideate → Prototype → Test → Iterate. I start by understanding users and business goals, create wireframes, build interactive prototypes, and validate through user testing.', 'Have portfolio examples ready to demonstrate your process.'],
    ['How do you stay current with technology trends?', 'General', 'Easy', 'General', 'I follow tech blogs, take online courses, attend meetups/conferences, contribute to open source, and build side projects. I also participate in communities like Reddit, HackerNews, and Discord groups.', 'Be specific about sources and recent things you learned.'],
    ['Design a recommendation system for an e-commerce platform.', 'System Design', 'Hard', 'Data Science', 'Discuss collaborative filtering, content-based filtering, hybrid approaches. Consider cold start problem, scalability, A/B testing, and real-time vs batch processing.', 'Draw the system architecture and discuss tradeoffs.']
  ];
  for (const iq of interviewData) {
    await pool.query(
      'INSERT INTO interview_questions (question, category, difficulty, career_path, sample_answer, tips) VALUES ($1,$2,$3,$4,$5,$6)',
      iq
    );
  }
  console.log('Interview questions seeded.');

  // Seed Mentors (15+)
  const mentorsData = [
    ['Dr. Sarah Chen', 'Principal ML Engineer', 'Google', 'AI/ML', 'Deep Learning, NLP, Computer Vision', 'PhD from Stanford. 15+ years in AI research and engineering. Published 40+ papers. Passionate about mentoring underrepresented students in tech.', 'Weekends'],
    ['James Rodriguez', 'Senior Product Manager', 'Microsoft', 'Technology', 'Product Strategy, Agile, User Research', '10 years in product management across startups and FAANG. MBA from Wharton. Focus on B2B SaaS products.', 'Evenings'],
    ['Priya Patel', 'VP of Engineering', 'Stripe', 'FinTech', 'System Design, Leadership, Payments', '20 years in software engineering. Built and led teams of 100+ engineers. Active angel investor and startup advisor.', 'Bi-weekly'],
    ['Dr. Michael Okonkwo', 'Cybersecurity Director', 'IBM', 'Cybersecurity', 'Threat Intelligence, Security Architecture', 'Former NSA analyst. CISSP certified. Runs a cybersecurity bootcamp for career changers.', 'Weekdays'],
    ['Lisa Chang', 'Design Director', 'Apple', 'Design', 'Product Design, Design Systems, Accessibility', '12 years in UX/UI design. Previously at IDEO and Airbnb. Advocate for inclusive design.', 'Monthly'],
    ['Ahmed Hassan', 'Data Science Lead', 'Netflix', 'Technology', 'Recommendation Systems, A/B Testing, Analytics', 'Built Netflix recommendation engine. PhD in Statistics from MIT. Open source contributor.', 'Weekends'],
    ['Dr. Emily Watson', 'Biomedical Research Director', 'Mayo Clinic', 'Healthcare', 'Medical Devices, Clinical Research', 'MD/PhD. 15 years in biomedical research. 30+ patents. Mentors students pursuing healthcare careers.', 'Monthly'],
    ['Carlos Mendez', 'Blockchain Lead', 'Coinbase', 'Web3/Crypto', 'Smart Contracts, DeFi, Tokenomics', '8 years in blockchain development. Former Wall Street trader turned crypto developer.', 'Evenings'],
    ['Rachel Kim', 'Marketing VP', 'HubSpot', 'Marketing', 'Growth Marketing, Content Strategy, Brand', '15 years in digital marketing. Built marketing teams from scratch. TEDx speaker.', 'Bi-weekly'],
    ['David Thompson', 'Cloud Architect', 'AWS', 'Cloud Computing', 'AWS, Multi-cloud, Serverless', 'AWS Hero. 12 certifications. Runs a YouTube channel with 200K subscribers on cloud topics.', 'Weekends'],
    ['Dr. Nina Volkov', 'AI Ethics Researcher', 'OpenAI', 'AI Ethics', 'AI Safety, Policy, Responsible AI', 'PhD in Philosophy of AI from Oxford. Advises governments on AI regulation.', 'Monthly'],
    ['Robert Nguyen', 'Startup Founder/CEO', 'TechStart Inc.', 'Entrepreneurship', 'Startups, Fundraising, Leadership', 'Serial entrepreneur with 3 exits. Y Combinator alum. Mentors at 500 Startups.', 'Weekdays'],
    ['Maria Garcia', 'Financial Analyst Director', 'Goldman Sachs', 'Finance', 'Financial Modeling, Investment Banking', 'CFA charterholder. 18 years on Wall Street. Passionate about financial literacy for students.', 'Weekends'],
    ['Dr. Alex Park', 'Robotics Professor', 'MIT', 'Engineering', 'Autonomous Systems, Control Theory, ROS', 'Runs MIT Robotics Lab. Former Boston Dynamics engineer. Author of popular robotics textbook.', 'Bi-weekly'],
    ['Jessica Taylor', 'Environmental Consultant', 'Deloitte', 'Environmental', 'Sustainability, ESG, Climate Tech', '10 years in environmental consulting. Helped Fortune 500 companies achieve carbon neutrality.', 'Monthly'],
    ['Kevin Wright', 'DevOps Director', 'Spotify', 'Technology', 'CI/CD, Kubernetes, Platform Engineering', 'Built Spotify internal developer platform. Speaker at KubeCon and DevOpsDays.', 'Evenings']
  ];
  for (const m of mentorsData) {
    await pool.query(
      'INSERT INTO mentors (name, title, company, industry, expertise, bio, availability) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      m
    );
  }
  console.log('Mentors seeded.');

  // Seed Scholarships (15+)
  const scholarshipsData = [
    ['Google Generation Scholarship', 'Google', '$10,000', 'March 15, 2026', 'CS/Engineering students, underrepresented groups', 'For students pursuing degrees in computer science, computer engineering, or closely related fields.', 'https://buildyourfuture.withgoogle.com'],
    ['Microsoft Tuition Scholarship', 'Microsoft', '$12,000', 'February 28, 2026', 'CS students with financial need', 'Full and partial tuition scholarships for students pursuing bachelor degrees in STEM fields.', 'https://microsoft.com/scholarships'],
    ['Amazon Future Engineer Scholarship', 'Amazon', '$40,000', 'January 31, 2026', 'HS seniors pursuing CS degrees', '$10,000/year for 4 years plus a paid summer internship at Amazon.', 'https://amazonfutureengineer.com'],
    ['Society of Women Engineers Scholarship', 'SWE', '$1,000 - $15,000', 'May 1, 2026', 'Women in engineering/CS', 'Multiple scholarships for women pursuing ABET-accredited engineering programs.', 'https://swe.org/scholarships'],
    ['National Science Foundation REU', 'NSF', '$6,000 stipend', 'Rolling', 'Undergraduate STEM students', 'Research Experience for Undergraduates - funded summer research opportunities at top universities.', 'https://nsf.gov/reu'],
    ['Palantir Women in Tech Scholarship', 'Palantir', '$7,000', 'April 30, 2026', 'Women in STEM', 'Grants for women pursuing technical studies who demonstrate leadership and academic excellence.', 'https://palantir.com/scholarships'],
    ['Meta Fellowship', 'Meta', '$42,000', 'September 30, 2026', 'PhD students in CS/AI', 'Two-year fellowship for PhD students doing cutting-edge research in AI, AR/VR, and security.', 'https://research.facebook.com/fellowship'],
    ['CyberCorps Scholarship for Service', 'NSF/DHS', 'Full tuition + $25,000/year', 'December 31, 2026', 'Cybersecurity students', 'Full ride for cybersecurity students who commit to government service after graduation.', 'https://sfs.opm.gov'],
    ['Thiel Fellowship', 'Thiel Foundation', '$100,000', 'December 31, 2026', 'Under 22, entrepreneurs', 'Two-year program for young people who want to build new things instead of sitting in a classroom.', 'https://thielfellowship.org'],
    ['Jack Kent Cooke Graduate Scholarship', 'Jack Kent Cooke Foundation', 'Up to $55,000/year', 'October 15, 2026', 'High-achieving students with financial need', 'For outstanding students with financial need pursuing graduate degrees at top universities.', 'https://jkcf.org'],
    ['Adobe Research Fellowship', 'Adobe', '$10,000', 'August 31, 2026', 'PhD students in CS/AI', 'Supports PhD students doing innovative research in AI, computer graphics, and HCI.', 'https://research.adobe.com/fellowship'],
    ['Apple HBCU Scholars Program', 'Apple', 'Varies', 'March 31, 2026', 'HBCU STEM students', 'Scholarships, mentorship, and internship opportunities for students at HBCUs.', 'https://apple.com/education'],
    ['Point Foundation LGBTQ Scholarship', 'Point Foundation', 'Up to $30,000', 'January 15, 2026', 'LGBTQ students', 'Scholarships for LGBTQ students with strong leadership and academic performance.', 'https://pointfoundation.org'],
    ['Schwarzman Scholars', 'Schwarzman Foundation', 'Full funding', 'September 15, 2026', 'Outstanding students globally', 'Fully-funded masters program at Tsinghua University focused on leadership and global affairs.', 'https://schwarzmanscholars.org'],
    ['GEM Fellowship', 'National GEM Consortium', 'Full tuition + stipend', 'October 1, 2026', 'Underrepresented STEM students', 'MS and PhD fellowships for underrepresented groups in engineering and science.', 'https://gemfellowship.org'],
    ['Hertz Fellowship', 'Hertz Foundation', 'Up to $250,000', 'October 28, 2026', 'PhD students in applied sciences', 'Most prestigious STEM fellowship. Five years of funding for innovative PhD research.', 'https://hertzfoundation.org']
  ];
  for (const s of scholarshipsData) {
    await pool.query(
      'INSERT INTO scholarships (name, provider, amount, deadline, eligibility, description, url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      s
    );
  }
  console.log('Scholarships seeded.');

  // Seed Networking Events (15+)
  const eventsData = [
    ['TechCrunch Disrupt 2026', 'October 2026', 'San Francisco, CA', 'Conference', 'Premier startup conference featuring pitches, panels, and networking with investors and founders.', 'Technology', 'https://techcrunch.com/events'],
    ['Grace Hopper Celebration', 'September 2026', 'Orlando, FL', 'Conference', 'Worlds largest gathering of women and non-binary technologists. Career fair with 300+ companies.', 'Technology', 'https://ghc.anitab.org'],
    ['AWS re:Invent', 'November 2026', 'Las Vegas, NV', 'Conference', 'Amazon biggest cloud computing conference with keynotes, workshops, and certification opportunities.', 'Cloud Computing', 'https://reinvent.awsevents.com'],
    ['Google I/O', 'May 2026', 'Mountain View, CA', 'Conference', 'Google annual developer conference showcasing latest in AI, Android, and web technologies.', 'Technology', 'https://io.google'],
    ['SXSW Interactive', 'March 2026', 'Austin, TX', 'Festival', 'Innovation festival bringing together tech, entertainment, and culture. Great for creative technologists.', 'Technology/Creative', 'https://sxsw.com'],
    ['Y Combinator Startup School', 'Ongoing', 'Online', 'Online Course', 'Free online program for aspiring founders. Includes weekly group sessions and mentorship.', 'Entrepreneurship', 'https://startupschool.org'],
    ['DEF CON', 'August 2026', 'Las Vegas, NV', 'Conference', 'Worlds largest hacking conference. Features CTF competitions, workshops, and security talks.', 'Cybersecurity', 'https://defcon.org'],
    ['PyCon US', 'April 2026', 'Pittsburgh, PA', 'Conference', 'Largest Python community conference. Tutorials, talks, sprints, and job fair.', 'Technology', 'https://us.pycon.org'],
    ['Figma Config', 'June 2026', 'San Francisco, CA', 'Conference', 'Design conference showcasing product design trends, tools, and community.', 'Design', 'https://config.figma.com'],
    ['MLConf', 'November 2026', 'San Francisco, CA', 'Conference', 'Machine learning conference featuring industry practitioners sharing real-world ML applications.', 'AI/ML', 'https://mlconf.com'],
    ['Women Who Code CONNECT', 'May 2026', 'Virtual', 'Conference', 'Global conference for women in technology featuring career development and technical talks.', 'Technology', 'https://womenwhocode.com'],
    ['National Society of Black Engineers Convention', 'March 2026', 'Atlanta, GA', 'Convention', 'Largest STEM diversity conference. Career fair, workshops, and networking for Black engineers.', 'Engineering', 'https://nsbe.org'],
    ['Product Hunt Maker Festival', 'July 2026', 'Online', 'Hackathon', 'Virtual hackathon where makers build and launch products. Great for portfolio building.', 'Technology', 'https://producthunt.com'],
    ['Bloomberg Global Tech Summit', 'September 2026', 'New York, NY', 'Summit', 'Exclusive summit connecting top tech talent with financial industry leaders.', 'Finance/Tech', 'https://bloomberg.com/events'],
    ['Climate Tech Summit', 'October 2026', 'Boston, MA', 'Conference', 'Connecting engineers, investors, and policymakers working on climate change solutions.', 'Environmental', 'https://climatetechsummit.com'],
    ['HackMIT', 'September 2026', 'Cambridge, MA', 'Hackathon', 'Premier college hackathon. Build projects over a weekend with 1000+ hackers.', 'Technology', 'https://hackmit.org']
  ];
  for (const e of eventsData) {
    await pool.query(
      'INSERT INTO networking_events (title, event_date, location, event_type, description, industry, url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      e
    );
  }
  console.log('Networking events seeded.');

  // Seed Learning Roadmaps (15+)
  const roadmapsData = [
    ['Full-Stack Web Developer', 'Software Engineering', 'HTML/CSS basics → JavaScript fundamentals → React.js → Node.js/Express → Databases (SQL & NoSQL) → API Development → Authentication → Deployment → Testing → CI/CD', '6-9 months', 'Complete roadmap from beginner to job-ready full-stack developer.'],
    ['Data Scientist', 'Data Science', 'Python basics → Statistics & Probability → Data Manipulation (Pandas) → Data Visualization → SQL → Machine Learning → Deep Learning → NLP → Big Data Tools → Portfolio Projects', '9-12 months', 'Comprehensive path to becoming a data scientist.'],
    ['UX/UI Designer', 'Design', 'Design principles → User research methods → Wireframing → Figma/Sketch → Prototyping → Usability testing → Design systems → Interaction design → Portfolio → Case studies', '4-6 months', 'From design novice to professional UX/UI designer.'],
    ['Cloud Engineer', 'Cloud Computing', 'Linux fundamentals → Networking basics → AWS/Azure fundamentals → Compute & Storage → Databases → Security → Containers → Kubernetes → Terraform → Monitoring → Certifications', '6-9 months', 'Path to becoming a certified cloud engineer.'],
    ['Machine Learning Engineer', 'AI/ML', 'Math foundations → Python → Data preprocessing → Classical ML → Neural Networks → CNNs/RNNs → Transformers → MLOps → Model Deployment → Research Papers', '12-18 months', 'Advanced path to ML engineering expertise.'],
    ['Cybersecurity Professional', 'Cybersecurity', 'Networking fundamentals → Linux → Security concepts → Cryptography → Web security → Penetration testing → Incident response → SIEM tools → Cloud security → Certifications (CompTIA, CISSP)', '9-12 months', 'From beginner to cybersecurity professional.'],
    ['Product Manager', 'Product Management', 'PM fundamentals → User research → Market analysis → Product strategy → Agile/Scrum → Metrics & analytics → Wireframing → Stakeholder management → Launch planning → Growth', '4-6 months', 'Transition into product management from any background.'],
    ['Mobile App Developer', 'Mobile Development', 'Programming basics → Swift/Kotlin → UI frameworks → API integration → Local storage → Push notifications → App architecture → Testing → App Store deployment → Performance optimization', '6-9 months', 'Build iOS or Android apps from scratch.'],
    ['DevOps Engineer', 'DevOps', 'Linux & scripting → Git → CI/CD pipelines → Docker → Kubernetes → Infrastructure as Code → Monitoring & logging → Security → Cloud platforms → SRE practices', '6-9 months', 'Comprehensive DevOps engineering path.'],
    ['Blockchain Developer', 'Web3', 'Cryptography basics → Bitcoin/Ethereum → Solidity → Smart contracts → Web3.js/ethers.js → DeFi protocols → NFTs → Security auditing → Testing → dApp deployment', '6-9 months', 'From crypto curious to blockchain developer.'],
    ['Digital Marketer', 'Marketing', 'Marketing fundamentals → SEO → Content marketing → Social media → Email marketing → PPC/Google Ads → Analytics → A/B testing → Marketing automation → Growth hacking', '3-6 months', 'Build comprehensive digital marketing skills.'],
    ['Financial Analyst', 'Finance', 'Accounting basics → Financial statements → Excel modeling → Valuation methods → Financial ratios → Industry analysis → Presentation skills → Bloomberg Terminal → CFA prep → Case studies', '6-9 months', 'Path to financial analysis career.'],
    ['Robotics Engineer', 'Robotics', 'Math & physics → Programming (C++/Python) → Electronics → Control systems → ROS → Computer vision → SLAM → Motion planning → Simulation → Hardware integration', '12-18 months', 'From fundamentals to building autonomous robots.'],
    ['AI Ethics Specialist', 'AI Ethics', 'AI/ML fundamentals → Ethics philosophy → Bias in AI → Fairness metrics → Privacy & data rights → Regulation (EU AI Act) → Impact assessment → Governance frameworks → Policy writing → Case analysis', '6-9 months', 'Become an AI ethics and responsible AI specialist.'],
    ['Healthcare Informatician', 'Healthcare', 'Healthcare systems → Medical terminology → Health informatics → EHR systems → HL7/FHIR → Data analytics → Privacy (HIPAA) → Clinical decision support → Interoperability → Project management', '9-12 months', 'Path to healthcare informatics career.'],
    ['Sustainability Consultant', 'Environmental', 'Environmental science basics → Climate change → ESG frameworks → Carbon accounting → LCA analysis → Sustainability reporting → GRI standards → Stakeholder engagement → Project management → Certification', '6-9 months', 'Become a professional sustainability consultant.']
  ];
  for (const r of roadmapsData) {
    await pool.query(
      'INSERT INTO learning_roadmaps (title, career_path, steps, duration, description) VALUES ($1,$2,$3,$4,$5)',
      r
    );
  }
  console.log('Learning roadmaps seeded.');

  // Seed Industry Insights (15+)
  const insightsData = [
    ['Artificial Intelligence', 'AI is transforming every industry. The global AI market is projected to reach $1.8 trillion by 2030.', 'Generative AI explosion, AI agents, multimodal models, edge AI, AI regulation', 'OpenAI, Google DeepMind, Anthropic, Meta AI, Microsoft', 'Talent shortage, ethics concerns, high compute costs, regulatory uncertainty', 'Enormous job creation, new product categories, industry disruption potential'],
    ['FinTech', 'Technology-driven financial services revolution. Digital payments, neobanking, and DeFi reshaping finance.', 'Embedded finance, open banking, BNPL, crypto regulation, AI in banking', 'Stripe, Square, Plaid, Robinhood, Revolut', 'Regulation, security threats, customer trust, competition from banks', 'Underbanked populations, cross-border payments, wealth management democratization'],
    ['Healthcare Technology', 'Digital health market growing rapidly. Telemedicine, AI diagnostics, and personalized medicine leading the charge.', 'AI diagnostics, telemedicine, wearables, digital therapeutics, genomics', 'Epic Systems, Veracyte, Teladoc, Medtronic, Illumina', 'Data privacy, regulatory hurdles, interoperability, adoption resistance', 'Preventive care, remote monitoring, drug discovery, mental health tech'],
    ['Cybersecurity', 'Critical sector as cyber threats grow in sophistication. Zero-trust security and AI-powered defense are the future.', 'Zero-trust architecture, AI threat detection, cloud security, ransomware defense', 'CrowdStrike, Palo Alto Networks, Fortinet, Zscaler, SentinelOne', 'Talent gap (3.5M unfilled jobs), evolving threats, complexity, alert fatigue', 'Massive market growth, government investment, security-as-a-service'],
    ['Clean Energy', 'Renewable energy sector booming with global investment exceeding $500B annually.', 'Solar/wind growth, battery storage, green hydrogen, smart grids, carbon capture', 'Tesla Energy, NextEra, Enphase, First Solar, Brookfield Renewable', 'Intermittency, grid infrastructure, policy dependence, supply chain', 'Government incentives, cost parity, ESG mandates, emerging markets'],
    ['E-Commerce', 'Online retail continues strong growth with social commerce and AI personalization driving innovation.', 'Social commerce, live shopping, AR try-on, drone delivery, headless commerce', 'Amazon, Shopify, Alibaba, MercadoLibre, Sea Limited', 'Logistics costs, competition, customer acquisition, returns management', 'Cross-border commerce, emerging markets, D2C brands, subscription models'],
    ['EdTech', 'Education technology reshaping learning. AI tutors, micro-credentials, and lifelong learning platforms growing.', 'AI tutoring, micro-credentials, cohort-based courses, VR learning, skills-based hiring', 'Coursera, Duolingo, Khan Academy, 2U, Byju', 'Engagement, completion rates, accreditation, digital divide', 'Lifelong learning market, corporate training, developing world access'],
    ['Gaming & Metaverse', 'Gaming industry larger than film and music combined. AR/VR and AI creating new experiences.', 'Cloud gaming, AI NPCs, UGC platforms, esports growth, spatial computing', 'Unity, Epic Games, Roblox, Nintendo, Sony Interactive', 'Hardware costs, content moderation, monetization ethics, user fatigue', 'Immersive experiences, creator economy, enterprise metaverse applications'],
    ['Biotechnology', 'Biotech revolution accelerating with CRISPR, mRNA, and synthetic biology breakthroughs.', 'Gene therapy, mRNA platforms, synthetic biology, AI drug discovery, personalized medicine', 'Moderna, CRISPR Therapeutics, Ginkgo Bioworks, Illumina, BioNTech', 'Regulation, development timelines, ethical concerns, high failure rates', 'Novel therapeutics, agricultural biotech, industrial applications, longevity'],
    ['Space Technology', 'Space industry democratizing with private companies reducing launch costs dramatically.', 'Satellite internet, space tourism, lunar economy, debris cleanup, in-orbit manufacturing', 'SpaceX, Blue Origin, Rocket Lab, Planet Labs, Relativity Space', 'High capital requirements, regulation, space debris, long development cycles', 'Satellite services, space mining, communications, earth observation'],
    ['Autonomous Vehicles', 'Self-driving technology advancing steadily. Robotaxis, autonomous trucks, and delivery bots expanding.', 'L4 autonomy, robotaxis, autonomous trucking, delivery robots, V2X communication', 'Waymo, Cruise, Tesla, Aurora, TuSimple', 'Safety validation, regulation, public trust, edge cases, weather', 'Logistics revolution, mobility-as-a-service, reduced accidents, urban planning'],
    ['Quantum Computing', 'Quantum computing approaching practical applications. Investment growing from governments and tech giants.', 'Error correction advances, quantum advantage demos, hybrid algorithms, quantum cloud', 'IBM Quantum, Google Quantum AI, IonQ, Rigetti, D-Wave', 'Decoherence, error rates, extreme cooling, limited developers, cost', 'Cryptography, drug discovery, optimization, materials science, finance'],
    ['SaaS & Cloud', 'Cloud and SaaS market continues rapid expansion. AI features becoming table stakes.', 'AI-powered features, vertical SaaS, PLG motions, consumption pricing, multi-cloud', 'Salesforce, ServiceNow, Snowflake, Datadog, MongoDB', 'Market saturation, churn, security concerns, vendor lock-in', 'AI copilots, industry-specific solutions, international expansion, SMB market'],
    ['Robotics & Automation', 'Industrial and service robotics growing rapidly. Humanoid robots emerging as new category.', 'Humanoid robots, collaborative robots, warehouse automation, surgical robots, farm robots', 'Boston Dynamics, Fanuc, ABB Robotics, Intuitive Surgical, Figure AI', 'Cost, integration complexity, workforce displacement concerns, safety', 'Labor shortage solutions, dangerous task automation, healthcare, agriculture'],
    ['Digital Health & Wellness', 'Mental health tech, fitness platforms, and preventive health tools growing rapidly.', 'Mental health apps, AI health coaching, continuous monitoring, preventive diagnostics', 'Calm, Headspace, Whoop, Oura, Noom', 'Clinical validation, regulation, data privacy, insurance coverage', 'Preventive care savings, employer wellness programs, aging population'],
    ['Web3 & Decentralized Tech', 'Decentralized technologies maturing beyond crypto speculation into real utility.', 'DeFi 2.0, real-world assets on-chain, decentralized identity, DAOs, zero-knowledge proofs', 'Ethereum, Polygon, Chainlink, Uniswap, Aave', 'Regulation, UX complexity, scalability, energy consumption, scams', 'Financial inclusion, ownership economy, transparent governance, digital identity']
  ];
  for (const i of insightsData) {
    await pool.query(
      'INSERT INTO industry_insights (industry, overview, trends, top_companies, challenges, opportunities) VALUES ($1,$2,$3,$4,$5,$6)',
      i
    );
  }
  console.log('Industry insights seeded.');

  // Seed Salary Insights (15+)
  const salaryData = [
    ['Software Engineer', 'Technology', '$75,000', '$120,000', '$165,000', 'US National Average', 'Wide salary range based on location, company size, and specialization. FAANG companies pay premium.'],
    ['Data Scientist', 'Technology', '$80,000', '$125,000', '$175,000', 'US National Average', 'High demand drives competitive salaries. PhD holders and ML specialists command premium.'],
    ['UX/UI Designer', 'Design', '$65,000', '$95,000', '$140,000', 'US National Average', 'Product designers at top tech companies can earn significantly more. Portfolio quality matters.'],
    ['Product Manager', 'Technology', '$85,000', '$130,000', '$180,000', 'US National Average', 'One of the highest-paid non-engineering roles. Total comp includes significant stock options.'],
    ['Cybersecurity Analyst', 'Security', '$70,000', '$105,000', '$150,000', 'US National Average', 'Certifications (CISSP, CEH) boost salary significantly. Government roles offer stability.'],
    ['ML Engineer', 'AI/ML', '$100,000', '$155,000', '$220,000', 'US National Average', 'Among the highest-paid roles in tech. PhD and research experience command top salaries.'],
    ['Cloud Architect', 'Technology', '$110,000', '$150,000', '$200,000', 'US National Average', 'Certifications (AWS SA, Azure) essential. Multi-cloud experience is premium.'],
    ['Digital Marketing Manager', 'Marketing', '$55,000', '$80,000', '$120,000', 'US National Average', 'Performance-based bonuses common. Agency vs in-house compensation differs significantly.'],
    ['Financial Analyst', 'Finance', '$60,000', '$85,000', '$130,000', 'US National Average', 'Wall Street and top consulting firms pay significantly above average. CFA boosts earnings.'],
    ['Biomedical Engineer', 'Healthcare', '$65,000', '$95,000', '$140,000', 'US National Average', 'Medical device companies and pharma offer highest salaries. PhD opens research roles.'],
    ['DevOps Engineer', 'Technology', '$80,000', '$120,000', '$165,000', 'US National Average', 'Platform engineering and SRE roles trending higher. Kubernetes expertise is premium.'],
    ['Blockchain Developer', 'Web3', '$90,000', '$140,000', '$200,000', 'US/Remote', 'Highly variable based on project. Token compensation common at crypto companies.'],
    ['Environmental Scientist', 'Environmental', '$50,000', '$75,000', '$110,000', 'US National Average', 'Government and consulting roles most common. Sustainability roles in corporations pay more.'],
    ['Robotics Engineer', 'Engineering', '$80,000', '$115,000', '$165,000', 'US National Average', 'Boston, SF, and Detroit are top hubs. Autonomous vehicle companies pay premium.'],
    ['Healthcare Administrator', 'Healthcare', '$60,000', '$90,000', '$140,000', 'US National Average', 'Hospital system size and location greatly impact salary. MHA/MBA preferred.'],
    ['AI Ethics Researcher', 'AI/ML', '$75,000', '$120,000', '$170,000', 'US National Average', 'Emerging field with growing demand. Top tech companies and think tanks are primary employers.']
  ];
  for (const s of salaryData) {
    await pool.query(
      'INSERT INTO salary_insights (role, industry, entry_level, mid_level, senior_level, location, description) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      s
    );
  }
  console.log('Salary insights seeded.');

  // Seed sample resumes
  await pool.query(`
    INSERT INTO resumes (user_id, title, content, target_role, experience_level) VALUES
    (1, 'Software Engineer Resume', 'Experienced in React, Node.js, and Python. Built 5+ full-stack applications.', 'Software Engineer', 'Entry Level'),
    (1, 'Data Science Resume', 'Skilled in Python, TensorFlow, and statistical analysis. 3 ML projects completed.', 'Data Scientist', 'Entry Level')
  `);

  // Seed sample portfolios
  await pool.query(`
    INSERT INTO portfolios (user_id, title, description, projects, skills_showcased) VALUES
    (1, 'Web Development Portfolio', 'Collection of full-stack web applications', 'E-commerce platform, Social media dashboard, Weather app, Task management system', 'React, Node.js, PostgreSQL, REST APIs'),
    (1, 'Data Science Portfolio', 'Data analysis and ML projects', 'Sentiment analysis tool, Stock price predictor, Image classifier, Recommendation engine', 'Python, TensorFlow, Pandas, Scikit-learn')
  `);

  // Seed sample assessments
  await pool.query(`
    INSERT INTO assessments (user_id, title, assessment_type, questions, results) VALUES
    (1, 'Career Interest Assessment', 'Holland Code (RIASEC)', 'Completed 60-question RIASEC assessment', 'Investigative-Artistic-Social (IAS) - Best matches: Data Scientist, UX Researcher, Technical Writer'),
    (1, 'Skills Assessment', 'Technical Skills Evaluation', 'Completed coding and analytical skills test', 'Strong in problem-solving and analytical thinking. Recommended: Software Engineering, Data Science')
  `);

  console.log('\nSeed completed successfully!');
  console.log('Login credentials: demo@student.com / demo123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
