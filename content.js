(function () {
  // Use a flag to prevent an infinite loop
  let isExpanding = false;

  // A function to unfold all of the jobs postings
  const expandAllJobs = () => {
    if (isExpanding) return; // Prevent duplicate runnings
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

    // After clicking, wait a bit for content to expand, then apply filtering
    // (Allows site JS to reveal the full text)
    setTimeout(() => {
      // Example: show only jobs that require up to 3 years of experience
      filterJobsByExperience(3);
    }, 1200);

    // Let the system cool down before allowing another expand run
    setTimeout(() => {
      isExpanding = false;
    }, 3000);
  };

  // Wait for the first job postings to load
  const waitForJobsAndExpand = () => {
    const jobs = document.querySelectorAll(".job-content-top");
    if (jobs.length > 0) {
      expandAllJobs();
    } else {
      setTimeout(waitForJobsAndExpand, 1000);
    }
  };

  // Extract a minimum number of years required from job text.
  // Returns integer years (minimum required) or null if not found.
  function extractMinYears(text) {
    if (!text) return null;

    // Normalize whitespace
    text = text.replace(/\s+/g, " ").toLowerCase();

    // 1) Direct "X+ years" e.g. "5+ years", "3+ years"
    let m = text.match(/(\d+)\s*\+\s*(?:years?|yrs?|שנים|שנה|שנות)/i);
    if (m) return parseInt(m[1], 10);

    // 2) "at least X years" / "minimum X years" / "לפחות X" / "מעל X" etc.
    m = text.match(
      /(?:at least|minimum|minim|לפחות|מעל|יותר מ|לפני)\s*(\d+)\b/i
    );
    if (m) return parseInt(m[1], 10);

    // 3) Range "X-Y years" or "X - Y years" -> take the first number as minimum
    m = text.match(/(\d+)\s*[-–]\s*\d+\s*(?:years?|yrs?|שנים|שנה|שנות)?/i);
    if (m) return parseInt(m[1], 10);

    // 4) Number followed by the word "years"/Hebrew forms within short distance
    m = text.match(/(\d+)(?=[^\d]{0,8}(?:years?|yrs?|year|שנה|שנות|שנים))/i);
    if (m) return parseInt(m[1], 10);

    // 5) Fallback: any mention of a number near "experience" or "ניסיון"
    m = text.match(/(\d+)[^\n]{0,20}(?:experience|exp|ניסיון)/i);
    if (m) return parseInt(m[1], 10);

    // 6) Specific Hebrew word forms like "שנתיים" (two years) - basic mapping
    // Note: this only covers common ones; numeric digits are more common in examples.
    if (text.includes("שנתיים")) return 2;
    if (text.includes("שלוש שנים") || text.includes("שלוש שנות")) return 3;

    // No clear years found
    return null;
  }

  // Filter job listings based on experience requirements.
  // maxYearsAllowed: show jobs that require <= maxYearsAllowed years.
  // If the job does not mention experience at all, keep it visible.
  function filterJobsByExperience(maxYearsAllowed = 3) {
    const jobElements = document.querySelectorAll(".job-content-top");
    let total = 0;
    let hidden = 0;
    let keptNoMention = 0;

    jobElements.forEach((job) => {
      total++;
      const text = job.innerText || job.textContent || "";
      const years = extractMinYears(text);

      // If no experience requirement found, keep visible (considered relevant)
      if (years === null) {
        job.style.display = "";
        keptNoMention++;
        return;
      }

      // Hide jobs that require more experience than allowed
      if (years > maxYearsAllowed) {
        job.style.display = "none";
        hidden++;
      } else {
        job.style.display = "";
      }
    });

    console.log(
      `🔎 filterJobsByExperience: total=${total}, hidden=${hidden}, keptNoMention=${keptNoMention}`
    );
  }

  // Listen to DOM changes (scrolling or dynamically loading of additional job listings)
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
      expandAllJobs();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial activation
  waitForJobsAndExpand();
})();
