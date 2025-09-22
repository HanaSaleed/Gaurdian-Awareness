import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./About.css";

export default function About() {
  const teamMembers = [
    {
      name: "Aazaf Ritha.J",
      role: "Team Lead, Content Developer",
      image: "/src/assets/aazaf-ritha.jpg",
      description: "Leading the development team and creating educational content for the platform."
    },
    {
      name: "Farhan",
      role: "Employee Part Developer",
      image: "https://via.placeholder.com/200x200/3498db/ffffff?text=F",
      description: "Developing employee-facing features and user experience components."
    },
    {
      name: "Hana Saleed",
      role: "Admin & Phishing Part Developer",
      image: "/src/assets/hana.jpg",
      description: "Building admin dashboard and phishing simulation features."
    },
    {
      name: "Sahan Wijerathna",
      role: "Authentication Developer",
      image: "/src/assets/sahan.jpeg",
      description: "Implementing secure authentication and authorization systems."
    },
    {
      name: "Thraka Rasnayaka",
      role: "Static Page Developer",
      image: "https://via.placeholder.com/200x200/f39c12/ffffff?text=TR",
      description: "Creating and maintaining static pages and UI components."
    }
  ];

  return (
    <>
      <Header />
      <div className="about-page">
        <div className="about-container">
          {/* Main About Section */}
          <div className="about-main">
            <h1>About Us</h1>
            <p>
              Guardians Awareness is a comprehensive security education platform designed to help 
              organizations and individuals stay informed about cybersecurity best practices.
            </p>
            <p>
              Our mission is to make security awareness accessible, engaging, and effective through 
              interactive quizzes, educational content, and practical simulations.
            </p>
            
            <h2>Our Features</h2>
            <ul>
              <li>Interactive Security Quizzes</li>
              <li>Educational Content Library</li>
              <li>Phishing Simulation Campaigns</li>
              <li>Compliance Management</li>
              <li>Progress Tracking</li>
            </ul>
          </div>

          {/* Developer Team Section */}
          <div className="team-section">
            <h2>Our Development Team</h2>
            <p className="team-description">
              Meet the talented developers who brought Guardians Awareness to life. 
              Each team member brings unique expertise to create a comprehensive security education platform.
            </p>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member-card">
                  <div className="member-image-container">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="member-image"
                    />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                    <p className="member-description">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
