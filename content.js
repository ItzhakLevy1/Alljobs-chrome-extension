(function () {
  // Use a flag to prevent an infinent loop
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

    // Let the system cool down before running again
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

  // Listen to DOM changes ( scrolling or dynamically loading of additional job listings )
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
