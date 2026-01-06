document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select (preserve placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // helper to get initials from an email/name
        function initialsFromString(s) {
          if (!s) return "?";
          const base = s.split("@")[0];
          const parts = base.split(/[^A-Za-z0-9]+/).filter(Boolean);
          if (parts.length === 0) return base[0]?.toUpperCase() || "?";
          return parts
            .slice(0, 2)
            .map(p => p[0].toUpperCase())
            .join("");
        }

        const participants = details.participants || [];
        let participantsHTML = "";
        if (participants.length > 0) {
          participantsHTML = `
            <div class="activity-card__participants">
              <h5 class="activity-card__participants-title">Participants</h5>
              <ul class="participants-list">
                ${participants
                  .map(
                    (p) =>
                      `<li class="participant" data-email="${p}"><span class="participant__avatar">${initialsFromString(
                        p
                      )}</span><span class="participant__name">${p}</span><button class="participant__delete" data-email="${p}" data-activity="${name}" aria-label="Remove participant">✕</button></li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p class="activity-availability"><strong>Availability:</strong> <span class="spots-left">${spotsLeft}</span> spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // attach delete handlers for participants
        activityCard.querySelectorAll('.participant__delete').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = btn.dataset.email;
            const activityName = btn.dataset.activity;
            if (!confirm(`Remove ${email} from ${activityName}?`)) return;
            try {
              const res = await fetch(
                `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
                { method: 'DELETE' }
              );
              const data = await res.json();
              if (res.ok) {
                const li = btn.closest('li.participant');
                if (li) li.remove();
                const spotsEl = activityCard.querySelector('.spots-left');
                if (spotsEl) {
                  const n = parseInt(spotsEl.textContent, 10) || 0;
                  spotsEl.textContent = (n + 1).toString();
                }
                messageDiv.textContent = data.message;
                messageDiv.className = 'success';
              } else {
                messageDiv.textContent = data.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
              }
              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 4000);
            } catch (err) {
              messageDiv.textContent = 'Failed to remove participant';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
              console.error('Error removing participant:', err);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities so participants and availability update immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
