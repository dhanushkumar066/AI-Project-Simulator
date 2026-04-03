const fs = require("fs").promises;
const pdfParse = require("pdf-parse");

// Parse PDF resume
async function parseResume(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Extract information
    const skills = extractSkills(text);
    const experience = extractExperience(text);
    const education = extractEducation(text);
    const summary = text.substring(0, 300);

    return {
      skills,
      experience,
      education,
      summary,
      fullText: text,
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    return {
      skills: [],
      experience: "Unable to parse",
      education: "Unable to parse",
      summary: "Resume uploaded successfully",
      fullText: "",
    };
  }
}

// Extract skills from resume text
function extractSkills(text) {
  const commonSkills = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "MongoDB",
    "SQL",
    "PostgreSQL",
    "MySQL",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Git",
    "HTML",
    "CSS",
    "Sass",
    "LESS",
    "TypeScript",
    "Angular",
    "Vue",
    "Svelte",
    "Express",
    "Django",
    "Flask",
    "Spring",
    "REST",
    "GraphQL",
    "Redux",
    "MobX",
    "Webpack",
    "Babel",
    "Jest",
    "Mocha",
    "Cypress",
    "Selenium",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning",
    "Data Science",
    "APIs",
    "Microservices",
    "CI/CD",
    "Agile",
    "Scrum",
  ];

  const foundSkills = commonSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase()),
  );

  return foundSkills;
}

// Extract experience
function extractExperience(text) {
  // Look for years of experience pattern
  const experienceMatch = text.match(
    /(\d+)\+?\s+(years?|yrs?)\s+(of\s+)?experience/i,
  );

  if (experienceMatch) {
    return `${experienceMatch[1]} years of experience`;
  }

  return "Experience information not clearly specified";
}

// Extract education
function extractEducation(text) {
  const degrees = [
    "B.Tech",
    "B.E",
    "B.Sc",
    "M.Tech",
    "M.E",
    "M.Sc",
    "M.S",
    "Bachelor",
    "Master",
    "PhD",
    "MBA",
    "BCA",
    "MCA",
  ];

  for (const degree of degrees) {
    if (text.includes(degree)) {
      return `${degree} degree mentioned`;
    }
  }

  return "Education information not clearly specified";
}

module.exports = {
  parseResume,
  extractSkills,
  extractExperience,
  extractEducation,
};
