let userRole = localStorage.getItem('kshitij_role') || '';

window.addEventListener('DOMContentLoaded', () => {
  if (!userRole) {
    document.getElementById('role-modal').classList.remove('hidden');
  } else {
    updateRoleUI();
  }
  renderLeads();
});

function setRole(role) {
  userRole = role;
  localStorage.setItem('kshitij_role', role);
  document.getElementById('role-modal').classList.add('hidden');
  updateRoleUI();
  renderLeads();
}

function openRoleModal() {
  document.getElementById('role-modal').classList.remove('hidden');
}

function updateRoleUI() {
  document.getElementById('role-badge').innerText = userRole;
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.remove('border-[#D32F2F]', 'text-[#D32F2F]', 'bg-red-50');
    el.classList.add('border-transparent', 'text-gray-600');
  });

  document.getElementById(`${tabName}-section`).classList.remove('hidden');
  const activeBtn = document.querySelector(`[data-target="${tabName}-section"]`);
  if (activeBtn) {
    activeBtn.classList.remove('border-transparent', 'text-gray-600');
    activeBtn.classList.add('border-[#D32F2F]', 'text-[#D32F2F]', 'bg-red-50');
  }
}

let leads = JSON.parse(localStorage.getItem('kshitij_leads')) || [
  { name: "Ramesh Sharma", phone: "9839011223", location: "Jankipuram Ext", type: "Rooftop", status: "Survey Scheduled", photo: "" },
  { name: "Anil Verma", phone: "9415022334", location: "Gomti Nagar", type: "Commercial", status: "Proposal Sent", photo: "" }
];

function saveLeads() {
  localStorage.setItem('kshitij_leads', JSON.stringify(leads));
  renderLeads();
}

function renderLeads() {
  const container = document.getElementById('leads-container');
  container.innerHTML = '';

  if (leads.length === 0) {
    container.innerHTML = `<div class="text-center p-8 bg-white rounded-2xl shadow-sm text-gray-400 text-xs">No inquiries recorded yet. Tap "+ Add Lead" to start.</div>`;
    return;
  }

  leads.forEach((lead, index) => {
    let statusBg = 'bg-orange-100 text-orange-800';
    if(lead.status === 'Completed') statusBg = 'bg-green-100 text-green-800';
    if(lead.status === 'Survey Scheduled') statusBg = 'bg-purple-100 text-purple-800';
    if(lead.status === 'Proposal Sent') statusBg = 'bg-blue-100 text-blue-800';

    let photoThumb = lead.photo 
      ? `<img src="${lead.photo}" class="w-12 h-12 object-cover rounded-xl cursor-pointer border shadow-sm hover:opacity-90 transition" onclick="openLightbox('${lead.photo}')">` 
      : `<div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] text-gray-400 italic border">No photo</div>`;

    let deleteBtn = userRole === 'Admin' 
      ? `<button onclick="deleteLead(${index})" class="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition">Delete</button>` 
      : `<span class="text-gray-300 text-xs" title="Admin only">🔒 Admin Locked</span>`;

    container.innerHTML += `
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col space-y-3 hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            ${photoThumb}
            <div>
              <h4 class="font-extrabold text-gray-900 text-sm">${lead.name}</h4>
              <p class="text-xs text-gray-500">📞 ${lead.phone} • 📍 ${lead.location}</p>
            </div>
          </div>
          <span class="text-[10px] px-2.5 py-1 rounded-full font-extrabold ${statusBg}">${lead.status}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
          <span class="font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">Type: ${lead.type}</span>
          <div class="space-x-2 flex items-center">
            <a href="tel:${lead.phone}" class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition">Call</a>
            <button onclick="openLeadModal(${index})" class="bg-orange-50 text-[#F57C00] px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 transition">Edit</button>
            ${deleteBtn}
          </div>
        </div>
      </div>
    `;
  });
}

function openLeadModal(index = null) {
  document.getElementById('lead-modal').classList.remove('hidden');
  document.getElementById('photo-preview-container').classList.add('hidden');
  document.getElementById('modal-photo').value = '';

  if (index !== null) {
    document.getElementById('modal-title').innerText = 'Edit Customer Inquiry';
    document.getElementById('lead-index').value = index;
    document.getElementById('modal-name').value = leads[index].name;
    document.getElementById('modal-phone').value = leads[index].phone;
    document.getElementById('modal-location').value = leads[index].location;
    document.getElementById('modal-type').value = leads[index].type;
    document.getElementById('modal-status').value = leads[index].status;
    
    if (leads[index].photo) {
      document.getElementById('photo-preview').src = leads[index].photo;
      document.getElementById('photo-preview-container').classList.remove('hidden');
    }
  } else {
    document.getElementById('modal-title').innerText = 'Add New Customer Inquiry';
    document.getElementById('lead-form').reset();
    document.getElementById('lead-index').value = '';
  }
}

function closeLeadModal() {
  document.getElementById('lead-modal').classList.add('hidden');
}

document.getElementById('lead-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const index = document.getElementById('lead-index').value;
  const name = document.getElementById('modal-name').value;
  const phone = document.getElementById('modal-phone').value;
  const location = document.getElementById('modal-location').value;
  const type = document.getElementById('modal-type').value;
  const status = document.getElementById('modal-status').value;
  const photoFile = document.getElementById('modal-photo').files[0];

  const processLeadData = (photoBase64) => {
    const leadData = {
      name, phone, location, type, status,
      photo: photoBase64 || (index !== '' ? leads[index].photo : '')
    };

    if (index !== '') {
      leads[index] = leadData;
    } else {
      leads.unshift(leadData);
    }
    saveLeads();
    closeLeadModal();
  };

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 500;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        processLeadData(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(photoFile);
  } else {
    processLeadData(null);
  }
});

function deleteLead(index) {
  if (userRole !== 'Admin') {
    alert('Access Denied: Only Partners/Admins can delete records.');
    return;
  }
  if (confirm('Delete this inquiry record?')) {
    leads.splice(index, 1);
    saveLeads();
  }
}

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-modal').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox-modal').classList.add('hidden');
}

function calculateSolar() {
  const monthlyBill = parseFloat(document.getElementById('calc-bill').value) || 0;
  if(monthlyBill <= 0) { alert('Please enter a valid monthly bill.'); return; }
  const estimatedUnits = monthlyBill / 8;
  const recommendedKw = Math.max(1, Math.round(estimatedUnits / 120 * 10) / 10);
  const grossCost = recommendedKw * 55000;
  const subsidy = recommendedKw <= 3 ? (recommendedKw * 18000) : 78000;
  const netCost = grossCost - subsidy;

  document.getElementById('calc-results').classList.remove('hidden');
  document.getElementById('res-kw').innerText = recommendedKw;
  document.getElementById('res-cost').innerText = grossCost.toLocaleString('en-IN');
  document.getElementById('res-subsidy').innerText = subsidy.toLocaleString('en-IN');
  document.getElementById('res-net').innerText = netCost.toLocaleString('en-IN');
}
