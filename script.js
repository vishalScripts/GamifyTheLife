// Quotes arrays for each bar
const leftQuotes = [
  "You want results? Then put in the work.",
  "Losers always have excuses; winners have discipline.",
  "💪 Grind today, shine tomorrow.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Hard work beats talent when talent doesn't work hard.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Focus on your goal. Don’t look in any direction but ahead.",
  // Add more quotes here
];

const centerQuotes = [
  "🎯 Stay focused on what matters.",
  "The clock is ticking; don't waste time.",
  "🔥 Stop scrolling. Start solving.",
  "Discipline is the bridge between goals and accomplishment.",
  "The more you sweat in practice, the less you bleed in battle.",
  "Don’t wait for the perfect moment. Take the moment and make it perfect.",
  "Focus on being productive instead of busy.",
  // Add more quotes here
];

const rightQuotes = [
  "Every excuse you make is stealing your future.",
  "⏳ Procrastination is the grave where dreams are buried.",
  "One hour of studying now beats regret later.",
  "If you don’t fight for what you want, don’t cry for what you lost.",
  "The only bad workout is the one that didn’t happen.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Make your dream a reality, or someone else will hire you to help make theirs.",
  // Add more quotes here
];

// Function to add quotes to each bar
function addQuotesToBar(barId, quotesArray) {
  const bar = document.getElementById(barId);
  quotesArray.forEach((quote, index) => {
    const quoteElement = document.createElement("div");
    quoteElement.className = "quote";
    quoteElement.textContent = quote;
    bar.appendChild(quoteElement);
  });
}

// Call the function for each bar
addQuotesToBar("left-quotes", leftQuotes);
addQuotesToBar("center-quotes", centerQuotes);
addQuotesToBar("right-quotes", rightQuotes);

// Script

const subjects = JSON.parse(localStorage.getItem("subjects")) || {};
const undoStack = [];

const subjectContainer = document.getElementById("subjects");
const xpDisplay = document.getElementById("xp-display");
const undoButton = document.getElementById("undo-button");

const chartCanvas = document.getElementById("subjectsChart");
let subjectsChart;
// Function to update the Chart.js chart
function updateChart() {
  const labels = Object.keys(subjects); // Subject names
  const progressData = labels.map((subject) => {
    const { chapters, completed } = subjects[subject];
    return completed;
  });

  console.log(progressData, "progress data");
  maxVal = labels.map((subject) => {
    const { chapters, completed } = subjects[subject];
    return chapters.length; // Calculate progress percentage
  });
  console.log(maxVal, "maxValue");

  if (!subjectsChart) {
    // Initialize the chart if it doesn't exist
    subjectsChart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Progress",
            data: progressData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)",
            ],
            borderColor: [
              "rgb(255, 99, 132)",
              "rgb(255, 159, 64)",
              "rgb(255, 205, 86)",
              "rgb(75, 192, 192)",
              "rgb(54, 162, 235)",
              "rgb(153, 102, 255)",
              "rgb(201, 203, 207)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...maxVal),
          },
        },
      },
    });
  } else {
    // Update the chart if it already exists
    subjectsChart.data.labels = labels;
    subjectsChart.data.datasets[0].data = progressData;
    subjectsChart.update();
  }
}

function saveToLocalStorage() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function pushToUndoStack(action) {
  undoStack.push(action);
  undoButton.disabled = false;
}

function undoAction() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    lastAction();
    saveToLocalStorage();
    renderSubjects();
    updateXP();
    if (undoStack.length === 0) undoButton.disabled = true;
  }
}

function renderSubjects() {
  subjectContainer.innerHTML = "";
  const subjectSelect = document.getElementById("subject-select");
  subjectSelect.innerHTML = "";

  for (const subject in subjects) {
    const { chapters, completed } = subjects[subject];

    // console.log(chapters -)
    const progress =
      chapters.length > 0 ? (completed / chapters.length) * 100 : 0;

    const section = document.createElement("div");
    section.className = "subject-section";

    section.innerHTML = `
      <div class="subject-header">
        <div class="firstchild">
          <h2>${subject}</h2>
          <div class="reward-section" id="${subject}-badges">
            ${generateBadges(progress)}
          </div>
        </div>
        
        <p> ${completed}/ ${chapters.length}</p>
        <div class="progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
      </div>
      <ul class="chapter-list" id="${subject}-list">
        ${chapters
          .map(
            (chapter, index) => `
            <li class="chapter-item ${chapter.completed ? "completed" : ""}">
              <span>${chapter.name}</span>
              <button ${
                chapter.completed
                  ? `class="red" onclick="toggleChapterCompletion('${subject}', ${index}, false)"`
                  : ` onclick="toggleChapterCompletion('${subject}', ${index}, true)"`
              }>
                ${chapter.completed ? `X` : "Complete"}
              </button>
            </li>
          `
          )
          .join("")}
      </ul>
      
    `;

    subjectContainer.appendChild(section);

    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  }
  updateChart();
}

function toggleChapterCompletion(subject, index, isComplete) {
  const chapter = subjects[subject].chapters[index];
  if (isComplete && !chapter.completed) {
    pushToUndoStack(() => {
      chapter.completed = false;
      subjects[subject].completed--;
      subjects[subject].xp -= 10;
    });
    chapter.completed = true;
    subjects[subject].completed++;
    subjects[subject].xp += 10;
  } else if (!isComplete && chapter.completed) {
    pushToUndoStack(() => {
      chapter.completed = true;
      subjects[subject].completed++;
      subjects[subject].xp += 10;
    });
    chapter.completed = false;
    subjects[subject].completed--;
    subjects[subject].xp -= 10;
  }
  updateXP();
  saveToLocalStorage();
  renderSubjects();
  updateChart();
}

function generateBadges(progress) {
  const badges = [
    '<span class="badge">🥉</span>', // Gray Bronze
    '<span class="badge">🥈</span>', // Gray Silver
    '<span class="badge">🥇</span>', // Gray Gold
    '<span class="badge">🏆</span>', // Gray Trophy
  ];

  if (progress >= 25) badges[0] = '<span class="badge active">🥉</span>'; // Bronze in color
  if (progress >= 50) badges[1] = '<span class="badge active">🥈</span>'; // Silver in color
  if (progress >= 75) badges[2] = '<span class="badge active">🥇</span>'; // Gold in color
  if (progress === 100) badges[3] = '<span class="badge active">🏆</span>'; // Trophy in color

  return badges.join(" ");
}

function addSubject() {
  const newSubject = document.getElementById("new-subject").value.trim();

  if (newSubject && !subjects[newSubject]) {
    pushToUndoStack(() => delete subjects[newSubject]);
    subjects[newSubject] = { chapters: [], completed: 0, xp: 0 };
    saveToLocalStorage();
    renderSubjects();
    document.getElementById("new-subject").value = "";
  } else {
    alert("Enter a unique subject name.");
  }
}

function addChapter() {
  const subject = document.getElementById("subject-select").value;
  const chapterName = document.getElementById("new-chapter").value.trim();

  if (chapterName && subjects[subject]) {
    pushToUndoStack(() => {
      subjects[subject].chapters.pop();
    });
    subjects[subject].chapters.push({
      name: chapterName,
      completed: false,
    });
    saveToLocalStorage();
    renderSubjects();
    updateChart();
    document.getElementById("new-chapter").value = "";
  } else {
    alert("Please select a subject and enter a valid chapter name.");
  }
}

function updateXP() {
  const totalXP = Object.values(subjects).reduce(
    (sum, subject) => sum + subject.xp,
    0
  );
  console.log(subjects);
  xpDisplay.textContent = `XP: ${totalXP / 10}`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

renderSubjects();
updateXP();
updateChart();

// Function to randomize the position and size of images and videos
function randomizeGrid() {
  const grid = document.getElementById("imageGrid");
  const items = Array.from(grid.children);

  // Shuffle the items (images and videos)
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]]; // Swap elements
  }

  // Randomize the size of each item
  items.forEach((item) => {
    const randomWidth = Math.random() * (50 - 30) + 30; // Random width between 30% and 50%
    const randomHeight = Math.random() * (50 - 30) + 30; // Random height between 30% and 50%
    item.style.width = `${randomWidth}%`;
    item.style.height = `${randomHeight}%`;
  });

  // Append the shuffled items back to the grid
  items.forEach((item) => grid.appendChild(item));
}

function playOnHover() {
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    let hoverTimeout;

    // Start the timer when the mouse enters
    video.addEventListener("mouseenter", () => {
      hoverTimeout = setTimeout(() => {
        if (video.paused) {
          video.play(); // Play the video after 2 seconds
        } else {
          video.pause(); // Pause the video if it's already playing
          video.currentTime = 0; // Reset the video to the beginning
        }
      }, 1000); // 2000 ms = 2 seconds
    });

    // Clear the timer if the mouse leaves before 2 seconds
    video.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout); // Cancel the play action
    });
  });
}

// Run the randomize and play functions when the page loads
window.onload = () => {
  randomizeGrid();
  playOnHover();
  updateChart();
};

const newChapterInput = document.getElementById("new-chapter");
const newSubInput = document.getElementById("new-subject");

newChapterInput.addEventListener("keydown", (e) => {
  e.preventDefault;
  console.log(e.key);
  if (e.key === "Enter") {
    addChapter();
  }
});
