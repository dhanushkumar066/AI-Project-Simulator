const fs = require("fs").promises;
const pdfParse = require("pdf-parse");

// Parse PDF resume
async function parseResume(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Extract information using simple regex (replace with NLP in production)
    const skills = extractSkills(text);
    const experience = extractExperience(text);
    const education = extractEducation(text);
    const summary = text.substring(0, 200); // First 200 chars as summary

    return {
      skills,
      experience,
      education,
      summary,
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    return {
      skills: [],
      experience: "Unable to parse",
      education: "Unable to parse",
      summary: "Resume uploaded successfully",
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
    "AWS",
    "Docker",
    "Git",
    "HTML",
    "CSS",
    "TypeScript",
    "Angular",
    "Vue",
    "Express",
    "Django",
    "Flask",
  ];

  const foundSkills = commonSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase()),
  );

  return foundSkills;
}

// Extract experience
function extractExperience(text) {
  // Simple extraction - look for years pattern
  const experienceMatch = text.match(
    /(\d+)\s+(years?|yrs?)\s+(of\s+)?experience/i,
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
    "M.Tech",
    "M.S",
    "Bachelor",
    "Master",
    "PhD",
  ];

  for (const degree of degrees) {
    if (text.includes(degree)) {
      return `${degree} degree mentioned`;
    }
  }

  return "Education information not clearly specified";
}

module.exports = parseResume;
