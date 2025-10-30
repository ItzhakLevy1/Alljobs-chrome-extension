/* Add an informative message to indicate that the extension for this site is on */
(function () {
  // Create a new message element
  const messageDiv = document.createElement("div");
  messageDiv.className = "my-extension-banner";

  // The message's text
  const textSpan = document.createElement("span");

  // The message's text
  const messageHTML = `🟢 התוסף שלי לסינון המשרות פעיל.`;

  textSpan.innerHTML = messageHTML;

  // Closing button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.className = "my-extension-close";

  // Add a closing event
  closeBtn.addEventListener("click", () => {
    messageDiv.remove();
  });

  // Add the elements to the message
  messageDiv.appendChild(textSpan);
  messageDiv.appendChild(closeBtn);

  // Add the message to the page
  document.body.appendChild(messageDiv);
})();

(function () {
  // -----------------------------
  // Flags
  // -----------------------------
  let isExpanding = false;

  // -----------------------------
  // Function to unfold all job postings
  // -----------------------------
  const expandAllJobs = () => {
    if (isExpanding) return;
    isExpanding = true;

    const moreButtons = document.querySelectorAll(
      '[id^="job-content-top-moretext"], .job-content-top-moretext, .show-more, .see-more'
    );

    let clickedCount = 0;

    moreButtons.forEach((button) => {
      const text = button.innerText.trim().toLowerCase();
      if (text.includes("עוד") || text.includes("show more")) {
        button.click();
        clickedCount++;
      }
    });

    console.log(`✅ ${clickedCount} job postings are fully open`);

    setTimeout(() => {
      isExpanding = false;
    }, 3000);
  };

  // -----------------------------
  // Function to hide VIP-only jobs
  // -----------------------------
  const hideVIPJobs = () => {
    const jobs = document.querySelectorAll(".job-box");
    jobs.forEach((job) => {
      const vipIcon = job.querySelector(
        ".job-content-top-vip img[src*='vip-job-icon.png']"
      );
      if (vipIcon) {
        job.style.display = "none";
      }
    });
  };

  // -----------------------------
  // Function to filter jobs by experience and degree
  // -----------------------------
  const filterJobsByExperienceAndDegree = () => {
    const jobs = document.querySelectorAll(".job-box");

    const excludeRegexes = [
      /ניסיון\s*של\s*מעל\s*\d+\s*שנים/i,
      /לפחות\s*\d+\s*שנות\s*ניסיון/i,
      /לפחות\s*\d+\s*שנים.*Angular/i,
      /\b\d+-\d+\+?\s*years.*mandatory/i,
      /\d+\+?\s*years of experience/i,
    ];

    jobs.forEach((job) => {
      const desc = job.innerText;
      const shouldHideExperience = excludeRegexes.some((r) => r.test(desc));
      const shouldHideDegree = /תואר/i.test(desc) || /degree/i.test(desc);

      if (shouldHideExperience || shouldHideDegree) {
        job.style.display = "none";
      } else if (job.style.display !== "none") {
        job.style.display = "block";
      }
    });
  };

  // -----------------------------
  // Function to mark applied jobs
  // -----------------------------
  const markAppliedJobs = () => {
    const jobs = document.querySelectorAll(".job-content-top");
    jobs.forEach((job) => {
      const appliedLabel = job.querySelector(".job-content-top-jobmissed");
      if (
        appliedLabel &&
        appliedLabel.innerText.includes("טרם הגשת מועמדות") === false
      ) {
        job.style.border = "2px solid green";
        job.style.backgroundColor = "#e6ffed";
      }
    });
  };

  // -----------------------------
  // Observer to detect dynamically added jobs
  // -----------------------------
  const observer = new MutationObserver((mutations) => {
    const jobAdded = mutations.some((m) =>
      Array.from(m.addedNodes).some(
        (node) =>
          node.nodeType === 1 &&
          (node.classList?.contains("job-content-top") ||
            node.querySelector?.(".job-content-top"))
      )
    );

    if (jobAdded) {
      runAll();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // -----------------------------
  // Wait for jobs to load initially
  // -----------------------------
  const waitForJobsAndExpand = () => {
    const jobs = document.querySelectorAll(".job-content-top");
    if (jobs.length > 0) {
      runAll();
    } else {
      setTimeout(waitForJobsAndExpand, 1000);
    }
  };

  // -----------------------------
  // Run all logic
  // -----------------------------
  const runAll = () => {
    expandAllJobs();
    hideVIPJobs();
    filterJobsByExperienceAndDegree();
    markAppliedJobs();
  };

  // -----------------------------
  // Initial activation
  // -----------------------------
  waitForJobsAndExpand();
})();
