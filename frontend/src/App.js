import React, { useState, useRef } from "react";
import "./App.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const fonts = ["Segoe UI", "Roboto", "Georgia"];
const themes = ["Light", "Dark", "Modern"];

function App() {
  const [resume, setResume] = useState({
    name: "John Doe",
    email: "john@example.com",
    linkedin: "https://linkedin.com/in/johndoe",
    summary: "Experienced frontend developer...",
    education: [{ degree: "", institution: "", year: "" }],
    experience: [{ role: "", company: "", duration: "" }],
    skills: [],
    achievements: [""],
    certifications: [""],
  });

  const [darkMode, setDarkMode] = useState(false);
  const [font, setFont] = useState(fonts[0]);
  const [theme, setTheme] = useState(themes[0]);
  const pdfRef = useRef();

  const updateArraySection = (field, idx, key, value) => {
    const arr = [...resume[field]];
    if (key !== null) {
      arr[idx][key] = value;
    } else {
      arr[idx] = value;
    }
    setResume({ ...resume, [field]: arr });
  };

  const addItem = (field) => {
    const current = resume[field];
    const newItem = typeof current[0] === "object"
      ? Object.fromEntries(Object.keys(current[0]).map(k => [k, ""]))
      : "";
    setResume({ ...resume, [field]: [...current, newItem] });
  };

  const removeItem = (field, idx) => {
    const filtered = resume[field].filter((_, i) => i !== idx);
    setResume({ ...resume, [field]: filtered });
  };

  const handleSaveResume = async () => {
    const response = await fetch("http://localhost:8000/save-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: resume }),
    });
    const result = await response.json();
    alert("Resume saved: " + result.status);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.json";
    link.click();
  };

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("resume.pdf");
  };

  const handleUploadResume = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setResume(data);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => window.print();

  const applyThemeClass = () => {
    let cls = `preview-${theme.toLowerCase()}`;
    if (darkMode) cls += " dark";
    return cls;
  };

  return (
    <div className={`App ${darkMode ? "dark" : ""}`} style={{ fontFamily: font }}>
      {/* Settings */}
      <div className="settings">
        <label>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark Mode
        </label>
        <label>
          Font:
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            {fonts.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label>
          Theme:
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {themes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {/* Editor */}
      <div className="form-section">
        <h1>Resume Editor</h1>

        {["name", "email", "linkedin"].map((field) => (
          <section key={field}>
            <h2>{field.charAt(0).toUpperCase() + field.slice(1)}</h2>
            <input
              value={resume[field]}
              onChange={(e) => setResume({ ...resume, [field]: e.target.value })}
            />
          </section>
        ))}

        <section>
          <h2>Summary</h2>
          <textarea
            rows="4"
            value={resume.summary}
            onChange={(e) => setResume({ ...resume, summary: e.target.value })}
          />
        </section>

        {["experience", "education", "achievements", "certifications"].map((field) => (
          <section key={field}>
            <h2>{field.charAt(0).toUpperCase() + field.slice(1)}</h2>
            {resume[field].map((item, idx) => (
              <div className="array-item" key={idx}>
                {typeof item === "object"
                  ? Object.keys(item).map((k) => (
                      <input
                        key={k}
                        value={item[k]}
                        placeholder={k}
                        onChange={(e) => updateArraySection(field, idx, k, e.target.value)}
                      />
                    ))
                  : (
                      <input
                        value={item}
                        placeholder="Enter text"
                        onChange={(e) => updateArraySection(field, idx, null, e.target.value)}
                      />
                    )}
                <button onClick={() => removeItem(field, idx)}>Remove</button>
              </div>
            ))}
            <button onClick={() => addItem(field)}>Add</button>
          </section>
        ))}

        <section>
          <h2>Skills</h2>
          <input
            value={resume.skills.join(", ")}
            onChange={(e) =>
              setResume({
                ...resume,
                skills: e.target.value.split(",").map((s) => s.trim()),
              })
            }
          />
        </section>

        {/* Actions */}
        <section className="actions">
          <button onClick={handleSaveResume}>Save Resume</button>
          <button onClick={handleDownloadJSON}>Download JSON</button>
          <button onClick={handleDownloadPDF}>Download PDF</button>
          <button onClick={handlePrint}>Print</button>
          <input type="file" onChange={handleUploadResume} />
        </section>
      </div>

      {/* Preview */}
      <div className={`preview-section ${applyThemeClass()}`} ref={pdfRef}>
        <h1>{resume.name}</h1>
        <p>
          <a href={`mailto:${resume.email}`}>{resume.email}</a> |{" "}
          <a href={resume.linkedin} target="_blank" rel="noopener noreferrer">
            {resume.linkedin}
          </a>
        </p>

        <h2>Summary</h2>
        <p>{resume.summary}</p>

        <h2>Experience</h2>
        {resume.experience
          .filter(e => e.role || e.company || e.duration)
          .map((e, i) => (
            <p key={i}>
              {e.role && <strong>{e.role}</strong>}
              {e.role && e.company && " at "}
              {e.company && <span>{e.company}</span>}
              {(e.role || e.company) && e.duration && ` (${e.duration})`}
            </p>
        ))}

        <h2>Education</h2>
        {resume.education
          .filter(e => e.degree || e.institution || e.year)
          .map((e, i) => (
            <p key={i}>
              {e.degree && <strong>{e.degree}</strong>}
              {e.degree && e.institution && ", "}
              {e.institution}
              {(e.degree || e.institution) && e.year && ` (${e.year})`}
            </p>
        ))}

        <h2>Achievements</h2>
        <ul>{resume.achievements.filter(a => a).map((a, i) => <li key={i}>{a}</li>)}</ul>

        <h2>Certifications</h2>
        <ul>{resume.certifications.filter(c => c).map((c, i) => <li key={i}>{c}</li>)}</ul>

        <h2>Skills</h2>
        <ul>{resume.skills.filter(s => s).map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>
    </div>
  );
}

export default App;
