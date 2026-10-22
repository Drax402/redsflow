<span id="redflowBuild" data-build="83" hidden></span>
    <div id="mainAppContainer" style="display: none; width: 100%; min-height: 100vh;">

        <nav id="sidebar" class="sidebar">
            <div class="sidebar-top-content">
                <div class="sidebar-header">
                    <div class="sidebar-brand-row">
                        <h1 class="logo-text"><span class="red-text">RED</span>FLOW</h1>
                        <button type="button" class="dm-top-btn dark-mode-toggle-btn" onclick="toggleDarkMode()" title="Dark mode" aria-label="Dark mode"><i class="fa-solid fa-moon dm-icon"></i></button>
                    </div>
                    <p class="sub-logo-text">Blood Types<span class="red-text"> Digital MasterList</span></p>
                </div>

                <div class="sidebar-menu-buttons" id="sidebarMenuContainer">

                </div>
            </div>
            <div class="sidebar-footer-action">
                <button class="btn-logout-side" onclick="openModal('logoutModal')"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
            </div>
        </nav>

        <div id="main-content" class="main-content">

            <header class="top-bar">
                <button id="menu-btn" class="menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
                <div class="brand-top"><span class="red-text">RED</span>FLOW</div>
                <div class="top-profile" onclick="openStaffProfile()" title="Open profile">
                    <div class="top-welcome">
                        <span class="top-welcome-hi">Welcome,</span>
                        <span class="top-welcome-name" id="headerUserName">User</span>
                        <span class="top-welcome-role" id="headerUserRole"></span>
                    </div>
                    <div class="top-profile-avatar">
                        <img id="headerAvatarImg" src="{{ asset('images/picture.jpg') }}" alt="Profile" onerror="this.onerror=null;this.src='/images/picture.jpg'">
                    </div>
                </div>
            </header>

            <section id="page-home" class="page-view active">
                <div class="search-filter-section-wrapper">
                    <div class="filter-section-header">
                        <h2>BLOOD TYPES DIGITAL MASTERLIST</h2>
                    </div>

                    <div class="section-search-bar-row">
                        <div class="input-with-icon">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="donor-search-input" placeholder="Search donor by blood type, name, or barangay..." oninput="debouncedFilterDonorsList()">
                        </div>
                    </div>
                    <div class="filter-controls-row">
                        <div class="dropdown-filter">
                            <button class="filter-drop-btn" onclick="toggleDropdown('abo-dropdown')"><i class="fa-solid fa-heart" style="color:var(--primary-red);"></i> ABO/Rh <i class="fa-solid fa-chevron-down"></i></button>
                            <div class="dropdown-content" id="abo-dropdown">
                                <a href="#" onclick="filterByAbo('All'); return false;">All ABO/Rh</a>
                                <a href="#" onclick="filterByAbo('A+'); return false;">A+</a>
                                <a href="#" onclick="filterByAbo('A-'); return false;">A-</a>
                                <a href="#" onclick="filterByAbo('B+'); return false;">B+</a>
                                <a href="#" onclick="filterByAbo('B-'); return false;">B-</a>
                                <a href="#" onclick="filterByAbo('AB+'); return false;">AB+</a>
                                <a href="#" onclick="filterByAbo('AB-'); return false;">AB-</a>
                                <a href="#" onclick="filterByAbo('O+'); return false;">O+</a>
                                <a href="#" onclick="filterByAbo('O-'); return false;">O-</a>
                            </div>
                        </div>
                        <div class="dropdown-filter">
                            <button class="filter-drop-btn" onclick="toggleDropdown('brgy-dropdown')"><i class="fa-solid fa-location-dot" style="color:var(--primary-red);"></i> ALL Brgys. <i class="fa-solid fa-chevron-down"></i></button>
                            <div class="dropdown-content scrollable-dropdown" id="brgy-dropdown">
                                <a href="#" onclick="filterByBrgy('All Brgys.'); return false;">All Brgys.</a>
                                <a href="#" onclick="filterByBrgy('Bacolod'); return false;">Bacolod</a>
                                <a href="#" onclick="filterByBrgy('San Agustin'); return false;">San Agustin</a>
                                <a href="#" onclick="filterByBrgy('San Juan'); return false;">San Juan</a>
                                <a href="#" onclick="filterByBrgy('San Julian'); return false;">San Julian</a>
                                <a href="#" onclick="filterByBrgy('San Pedro'); return false;">San Pedro</a>
                                <a href="#" onclick="filterByBrgy('Bagsangan'); return false;">Bagsangan</a>
                                <a href="#" onclick="filterByBrgy('Batang'); return false;">Batang</a>
                                <a href="#" onclick="filterByBrgy('Bolos'); return false;">Bolos</a>
                                <a href="#" onclick="filterByBrgy('Buenavista'); return false;">Buenavista</a>
                                <a href="#" onclick="filterByBrgy('Bulawan'); return false;">Bulawan</a>
                                <a href="#" onclick="filterByBrgy('Carriedo'); return false;">Carriedo</a>
                                <a href="#" onclick="filterByBrgy('Casini'); return false;">Casini</a>
                                <a href="#" onclick="filterByBrgy('Cawayan'); return false;">Cawayan</a>
                                <a href="#" onclick="filterByBrgy('Cogon'); return false;">Cogon</a>
                                <a href="#" onclick="filterByBrgy('Gabao'); return false;">Gabao</a>
                                <a href="#" onclick="filterByBrgy('Gulang-Gulang'); return false;">Gulang-Gulang</a>
                                <a href="#" onclick="filterByBrgy('Gumapia'); return false;">Gumapia</a>
                                <a href="#" onclick="filterByBrgy('Liang'); return false;">Liang</a>
                                <a href="#" onclick="filterByBrgy('Macawayan'); return false;">Macawayan</a>
                                <a href="#" onclick="filterByBrgy('Mapaso'); return false;">Mapaso</a>
                                <a href="#" onclick="filterByBrgy('Monbon'); return false;">Monbon</a>
                                <a href="#" onclick="filterByBrgy('Patag'); return false;">Patag</a>
                                <a href="#" onclick="filterByBrgy('Salvacion'); return false;">Salvacion</a>
                                <a href="#" onclick="filterByBrgy('San Isidro'); return false;">San Isidro</a>
                                <a href="#" onclick="filterByBrgy('Santo Domingo'); return false;">Santo Domingo</a>
                                <a href="#" onclick="filterByBrgy('Tabon-Tabon'); return false;">Tabon-Tabon</a>
                                <a href="#" onclick="filterByBrgy('Tinampo'); return false;">Tinampo</a>
                                <a href="#" onclick="filterByBrgy('Tongdol'); return false;">Tongdol</a>
                            </div>
                        </div>
                    </div>
                    <div id="donorBulkBar" class="admin-bulk-bar">
                        <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); cursor:pointer;">
                            <input type="checkbox" class="admin-row-checkbox" id="donorSelectAll" onchange="toggleSelectAllDonors(this.checked)" style="margin-right:0;"> Select All
                        </label>
                        <button id="donorDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedDonors()"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                    </div>
                </div>
                <div class="donor-count-label" id="donor-count-label">8 Donors List</div>
                <div class="donor-cards-container" id="donor-cards-wrapper">

                </div>
            </section>

            <section id="page-events" class="page-view">

                <div id="wizard-step-0" class="create-wizard-card">
                    <div style="display:flex; justify-content:center; margin-bottom:15px;">
                        <svg viewBox="0 0 24 24" width="45" height="55" fill="var(--primary-red)"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path fill="#ffffff" d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z"/></svg>
                    </div>
                    <h2>Create Digital Masterlist of Donors</h2>
                    <p>Create and manage the official digital masterlist of verified blood donors. Add donor information, blood type, location, contact details, availability, and verification status.</p>
                    <button class="wizard-main-btn" onclick="goToWizardStep(1)"><i class="fa-solid fa-user-plus"></i> ADD DONOR</button>
                </div>

                <div id="wizard-step-1" class="wizard-step-container">
                    <div class="wizard-inner-box">
                        <button type="button" class="su-close-btn" title="Close" onclick="cancelDonorWizard()"><i class="fa-solid fa-xmark"></i></button>
                        <div class="brand-redflow" style="color:var(--primary-red); font-weight:bold; font-size:18px; margin-bottom:2px;"><span class="red-text">RED</span>FLOW</div>
                        <h3>Create Donor Information</h3>
                        <div class="wizard-subtitle">Personal Details</div>

                        <div class="wizard-input-group">
                            <i class="fa-solid fa-user"></i>
                            <input type="text" id="w_firstName" placeholder="First Name" required>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-user"></i>
                            <input type="text" id="w_middleName" placeholder="Middle Name">
                        </div>
                        <div class="checkbox-row">
                            <input type="checkbox" id="w_noMiddle" onclick="toggleMiddleName(this)">
                            <label for="w_noMiddle">I have no Middle Name</label>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-user"></i>
                            <input type="text" id="w_lastName" placeholder="Last Name" required>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-user"></i>
                            <select id="w_ext">
                                <option value="">Ext.</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                                <option value="V">V</option>
                            </select>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-calendar"></i>
                            <input type="date" id="w_bday" required>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-venus-mars"></i>
                            <select id="w_sex" required>
                                <option value="" disabled selected>Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-phone"></i>
                            <div class="ph-wrap"><span class="ph-prefix">+63</span><input type="tel" id="w_contact" placeholder="9XXXXXXXXX" maxlength="10" inputmode="numeric" oninput="this.value=this.value.replace(/\D/g,'').replace(/^0+/,'').slice(0,10)" required></div>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-droplet" style="color:var(--primary-red);"></i>
                            <select id="w_bloodType" required>
                                <option value="" disabled selected>Blood Type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div class="wizard-btn-row">
                            <button class="wizard-btn-back" onclick="goToWizardStep(0)">BACK</button>
                            <button class="wizard-btn-next" onclick="validateStep1AndProceed()">NEXT</button>
                        </div>
                    </div>
                </div>

                <div id="wizard-step-2" class="wizard-step-container">
                    <div class="wizard-inner-box">
                        <button type="button" class="su-close-btn" title="Close" onclick="cancelDonorWizard()"><i class="fa-solid fa-xmark"></i></button>
                        <h3 style="color:var(--primary-red); margin-bottom:15px;">Location Details</h3>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-earth-asia"></i>
                            <input type="text" value="Philippines" disabled style="background:var(--bg-light); color:var(--text-muted);">
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-map"></i>
                            <input type="text" value="Bicol Region" disabled style="background:var(--bg-light); color:var(--text-muted);">
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-location-dot"></i>
                            <select id="w_province" disabled style="background:var(--bg-light); color:var(--text-muted);">
                                <option selected>Sorsogon</option>
                            </select>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-city"></i>
                            <select id="w_municipality" disabled style="background:var(--bg-light); color:var(--text-muted);">
                                <option selected>Irosin</option>
                            </select>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-house-chimney"></i>
                            <select id="w_barangay" required>
                                <option value="" disabled selected>Barangay</option>
                                <option value="Bacolod">Bacolod</option>
                                <option value="San Agustin">San Agustin</option>
                                <option value="San Juan">San Juan</option>
                                <option value="San Julian">San Julian</option>
                                <option value="San Pedro">San Pedro</option>
                                <option value="Bagsangan">Bagsangan</option>
                                <option value="Batang">Batang</option>
                                <option value="Bolos">Bolos</option>
                                <option value="Buenavista">Buenavista</option>
                                <option value="Bulawan">Bulawan</option>
                                <option value="Carriedo">Carriedo</option>
                                <option value="Casini">Casini</option>
                                <option value="Cawayan">Cawayan</option>
                                <option value="Cogon">Cogon</option>
                                <option value="Gabao">Gabao</option>
                                <option value="Gulang-Gulang">Gulang-Gulang</option>
                                <option value="Gumapia">Gumapia</option>
                                <option value="Liang">Liang</option>
                                <option value="Macawayan">Macawayan</option>
                                <option value="Mapaso">Mapaso</option>
                                <option value="Monbon">Monbon</option>
                                <option value="Patag">Patag</option>
                                <option value="Salvacion">Salvacion</option>
                                <option value="San Isidro">San Isidro</option>
                                <option value="Santo Domingo">Santo Domingo</option>
                                <option value="Tabon-Tabon">Tabon-Tabon</option>
                                <option value="Tinampo">Tinampo</option>
                                <option value="Tongdol">Tongdol</option>
                            </select>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-hospital"></i>
                            <input type="text" id="w_venue" placeholder="Venue" maxlength="120">
                        </div>
                        <div class="wizard-btn-row">
                            <button class="wizard-btn-back" onclick="goToWizardStep(1)">BACK</button>
                            <button class="wizard-btn-next" onclick="validateLocationAndProceed()">NEXT</button>
                        </div>
                    </div>
                </div>

                <div id="wizard-step-3" class="wizard-step-container">
                    <div class="wizard-inner-box">
                        <button type="button" class="su-close-btn" title="Close" onclick="cancelDonorWizard()"><i class="fa-solid fa-xmark"></i></button>
                        <h3 style="color:var(--primary-red); margin-bottom:6px;">Health &amp; Additional Information</h3>
                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:15px;">For reference only. Final medical screening and eligibility must always be confirmed by authorized health personnel.</div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-weight-scale"></i>
                            <input type="text" id="w_weight" placeholder="Weight (kg)" inputmode="decimal">
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-heart-pulse"></i>
                            <input type="text" id="w_bp" placeholder="Blood Pressure (e.g. 120/80)" inputmode="numeric" maxlength="7">
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-ruler-vertical"></i>
                            <input type="text" id="w_height" placeholder="Height (cm)" inputmode="decimal">
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-droplet"></i>
                            <input type="text" id="w_hemoglobin" placeholder="Hemoglobin (g/dL)" inputmode="decimal" maxlength="5">
                        </div>
                        <div class="wizard-input-group">
                            <div id="w_eligibilityStatus_host"></div>
                        </div>
                        <div class="wizard-input-group">
                            <div id="w_allergies_host"></div>
                        </div>
                        <div class="wizard-input-group" id="w_medicalConditions_wrap">
                            <div id="w_medicalConditions_host"></div>
                        </div>
                        <div class="wizard-input-group">
                            <div id="w_deferralReason_host"></div>
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-user-shield"></i>
                            <input type="text" id="w_emergencyContactName" placeholder="Emergency Contact Name">
                        </div>
                        <div class="wizard-input-group">
                            <i class="fa-solid fa-phone"></i>
                            <div class="ph-wrap"><span class="ph-prefix">+63</span><input type="tel" id="w_emergencyContactNumber" placeholder="Emergency Contact Number" maxlength="10" inputmode="numeric" oninput="this.value=this.value.replace(/\D/g,'').replace(/^0+/,'').slice(0,10)"></div>
                        </div>

                        <div class="wizard-btn-row">
                            <button class="wizard-btn-back" onclick="goToWizardStep(2)">BACK</button>
                            <button class="wizard-btn-next" onclick="validateStep3AndProceed()">NEXT</button>
                        </div>
                    </div>
                </div>

                <div id="wizard-step-4" class="wizard-step-container">
                    <div class="wizard-inner-box" style="text-align:left; max-width:780px; margin:0 auto;">
                        <button type="button" class="su-close-btn" title="Close" onclick="cancelDonorWizard()"><i class="fa-solid fa-xmark"></i></button>
                        <input type="file" id="wizardAvatarFile" accept="image/*" style="display:none;" onchange="handleWizardAvatarUpload(event)">
                        <div class="profile-upload-circle" onclick="document.getElementById('wizardAvatarFile').click()">
                            <img id="wizardAvatarPreview" src="{{ asset('images/picture.jpg') }}" alt="Avatar" onerror="this.onerror=null;this.src='/images/picture.jpg'">
                        </div>
                        <div id="wizardAvatarUploadLabel" style="text-align:center; font-size:12px; color:var(--primary-red); font-weight:bold; margin-bottom:10px; cursor:pointer;" onclick="document.getElementById('wizardAvatarFile').click()">
                            <i class="fa-solid fa-camera"></i> Click to change photo
                        </div>
                        <div class="avatar-picker-label">Or choose an avatar</div>
                        <div class="avatar-picker" id="wizardAvatarPicker"></div>
                        <div class="rev-grid">
                            <div class="rev-section">Personal Information</div>
                            <div class="form-group-custom"><label>First Name</label><input type="text" id="rev_firstName"></div>
                            <div class="form-group-custom"><label>Middle Name</label><input type="text" id="rev_middleName"></div>
                            <div class="form-group-custom"><label>Surname</label><input type="text" id="rev_lastName"></div>
                            <div class="form-group-custom"><label>Ext.</label><input type="text" id="rev_ext"></div>
                            <div class="form-group-custom"><label>Blood Type</label><input type="text" id="rev_bloodType"></div>
                            <div class="form-group-custom"><label>Birthday</label><input type="date" id="rev_bday"></div>
                            <div class="form-group-custom"><label>Sex</label><select id="rev_sex" onchange="onRevSexChange(this.value)"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            <div class="form-group-custom"><label>Contact Number</label><input type="text" id="rev_contact"></div>
                            <div class="rev-section">Location</div>
                            <div class="form-group-custom"><label>Location</label><input type="text" id="rev_location"></div>
                            <div class="form-group-custom"><label>Venue</label><input type="text" id="rev_venue"></div>
                            <div class="rev-section">Health Information</div>
                            <div class="form-group-custom"><label>Weight (kg)</label><input type="text" id="rev_weight" inputmode="decimal"></div>
                            <div class="form-group-custom"><label>Blood Pressure</label><input type="text" id="rev_bp" placeholder="e.g. 120/80" maxlength="7" inputmode="numeric"></div>
                            <div class="form-group-custom"><label>Height (cm)</label><input type="text" id="rev_height" inputmode="decimal"></div>
                            <div class="form-group-custom"><label>Hemoglobin (g/dL)</label><input type="text" id="rev_hemoglobin" inputmode="decimal" maxlength="5"></div>
                            <div class="form-group-custom"><label>Eligibility Status</label><select id="rev_eligibility"><option value="Eligible">Eligible</option><option value="Permanently Deferred">Permanently Deferred</option><option value="Under Review">Under Review</option></select></div>
                            <div class="form-group-custom"><label>Known Allergies</label><input type="text" id="rev_allergies" maxlength="120"></div>
                            <div class="form-group-custom"><label>Existing Medical Conditions</label><input type="text" id="rev_medical" maxlength="120"></div>
                            <div class="form-group-custom"><label>Deferral / Screening Notes</label><input type="text" id="rev_deferral" maxlength="120"></div>
                            <div class="rev-section">Emergency Contact</div>
                            <div class="form-group-custom"><label>Emergency Contact Name</label><input type="text" id="rev_emName" maxlength="120"></div>
                            <div class="form-group-custom"><label>Emergency Contact Number</label><input type="text" id="rev_emNumber" maxlength="13" placeholder="+639XXXXXXXXX" inputmode="tel"></div>
                            <div class="rev-section">Status</div>
                            <div class="form-group-custom rev-full"><label>Status</label><input type="text" id="rev_status" disabled style="font-weight:bold;"></div>
                            </div>
                        <div style="display:flex; gap:15px; margin-top:15px;">
                            <button type="button" class="wizard-btn-back" style="flex:1;" onclick="goToWizardStep(3)">BACK</button>
                            <button type="button" class="action-main-btn" style="background:#990000; margin-top:0; flex:1;" onclick="commitNewDonor()">CREATE</button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="page-history" class="page-view">
                <div style="background:var(--card-bg); padding:20px; border-radius:8px;">
                    <div style="font-size: 24px; font-weight: bold; color: var(--text-dark); margin-bottom: 15px; text-align: center;">History Records</div>

                    <div class="section-search-bar-row" style="margin-bottom: 20px;">
                        <div class="input-with-icon">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="history-search-input" placeholder="Search history records by name or blood type..." oninput="debouncedFilterHistoryRecords()">
                        </div>
                    </div>
                    <div id="historyBulkBar" class="admin-bulk-bar">
                        <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); cursor:pointer;">
                            <input type="checkbox" class="admin-row-checkbox" id="historySelectAll" onchange="toggleSelectAllRecords(this.checked)" style="margin-right:0;"> Select All
                        </label>
                        <button id="historyDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedRecords()"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                    </div>
                    <div id="monitoring-table-container" style="display:flex; flex-direction:column; gap:15px;">

                    </div>
                </div>
            </section>

            <section id="page-statistics" class="page-view">
                <div class="stats-toolbar">
                    <button type="button" class="stats-export-btn" onclick="exportStatisticsExcel()"><i class="fa-solid fa-file-excel"></i> Export to Excel</button>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:20px;">
                    <div class="stat-summary-card" style="border-left-color:var(--warning-orange);">
                        <div class="stat-summary-label">Number of Pending Staff</div>
                        <div id="statTotalPending" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--warning-orange);">
                        <div class="stat-summary-label">Under Review</div>
                        <div id="statPendingDonor" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--primary-blue);">
                        <div class="stat-summary-label">Number of Admin</div>
                        <div id="statNumberAdmin" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--primary-red);">
                        <div class="stat-summary-label">Number of Staff</div>
                        <div id="statNumberStaff" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--success-green);">
                        <div class="stat-summary-label">Total Donors</div>
                        <div id="statNumberDonors" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--success-green);">
                        <div class="stat-summary-label">Eligible</div>
                        <div id="statQualified" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--primary-blue);">
                        <div class="stat-summary-label">Permanently Deferred</div>
                        <div id="statPermDeferred" class="stat-summary-value">0</div>
                    </div>
                    <div class="stat-summary-card" style="border-left-color:var(--primary-red);">
                        <div class="stat-summary-label">Rejected</div>
                        <div id="statRejectedTop" class="stat-summary-value">0</div>
                    </div>
                </div>
                <div class="stats-panels-row">
                    <div class="stats-panel-box">
                        <div class="stats-panel-header">
                            <h3><i class="fa-solid fa-chart-column" style="color:var(--primary-red); margin-right:6px;"></i>Monthly Donations</h3>
                            <input type="date" id="monthlyDonationsDate" class="stats-date-input" onchange="updateStatisticsData()">
                        </div>
                        <div class="monthly-chart-wrap" id="monthlyDonationsChart"></div>
                        <div class="monthly-chart-labels" id="monthlyDonationsLabels"></div>
                        <div class="stats-year-total" id="monthlyTotalPerYear">Total Per Year: 0</div>
                    </div>
                    <div class="stats-panel-box">
                        <div class="stats-panel-header">
                            <h3><i class="fa-solid fa-droplet" style="color:var(--primary-red); margin-right:6px;"></i>Blood Type Availability</h3>
                        </div>
                        <div id="bloodTypeAvailabilityList"></div>
                    </div>
                </div>

                <div class="stats-panels-row stats-equal-row">
                    <div class="stats-panel-box stats-auto-h">
                        <div class="stats-panel-header">
                            <h3><i class="fa-solid fa-calendar-days" style="color:var(--primary-red); margin-right:6px;"></i>Weekly Donation Calendar</h3>
                            <input type="date" id="weeklyDonationDate" class="stats-date-input" onchange="renderWeeklyDonation()">
                        </div>
                        <div id="weeklyCalendarGrid"></div>
                    </div>
                    <div class="stats-panel-box stats-auto-h">
                        <div class="stats-panel-header">
                            <h3><i class="fa-solid fa-chart-simple" style="color:var(--primary-red); margin-right:6px;"></i>Weekly Statistics</h3>
                        </div>
                        <div id="weeklyStatsList"></div>
                        <div class="stats-year-total" id="weeklyStatsTotal" style="text-align:left;">Total (Week 1-5): 0 donations</div>
                    </div>
                </div>

                <div class="stats-panels-row stats-equal-row">
                    <div class="stats-panel-box stats-auto-h">
                        <div class="stats-panel-header">
                            <h3><i class="fa-solid fa-user-check" style="color:var(--primary-red); margin-right:6px;"></i>Donor Screening</h3>
                            <input type="date" id="screeningDate" class="stats-date-input" onchange="renderScreeningStats()">
                        </div>
                        <div id="screeningStatsList"></div>
                    </div>
                    <div class="stats-panel-box stats-auto-h">
                        <div class="stats-panel-header">
                            <h3><i class="fa-solid fa-droplet" style="color:var(--primary-red); margin-right:6px;"></i>Collected Bags</h3>
                            <input type="date" id="bagsDate" class="stats-date-input" onchange="renderCollectedBags()">
                        </div>
                        <div id="collectedBagsList"></div>
                    </div>
                </div>

                <div class="stats-panel-box stats-auto-h" style="margin-top:20px;">
                    <div class="stats-panel-header">
                        <h3><i class="fa-solid fa-chart-pie" style="color:var(--primary-red); margin-right:6px;"></i>Blood Types Statistics Distribution</h3>
                        <input type="date" id="distDate" class="stats-date-input" onchange="renderBloodDistribution()">
                    </div>
                    <div id="bloodDistribution"></div>
                </div>
            </section>

            <section id="page-bloodinventory" class="page-view">
                <div class="about-card">
                    <div class="bs-head">
                        <div>
                            <p class="about-hero" style="margin:0; text-align:left;"><i class="fa-solid fa-boxes-stacked" style="color:var(--primary-red);"></i> BLOOD INVENTORY</p>
                            <div class="bs-sub">Every collected bag of blood: how many are in stock, used, expired, rejected or disposed.</div>
                        </div>
                        <div class="bs-head-btns">
                            <button type="button" class="bs-btn red" onclick="openBloodBagModal()"><i class="fa-solid fa-plus"></i> RECORD COLLECTED BAG</button>
                            <button type="button" class="bs-btn green" onclick="exportBloodInventoryExcel()"><i class="fa-solid fa-file-excel"></i> EXCEL</button>
                        </div>
                    </div>
                    <div class="bs-summary" id="bagInvSummary"></div>
                    <div class="bs-filter-row">
                        <div class="req-tabs" id="bagInvTabs" style="margin:0;"></div>
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                            <div id="bagInvDeleteTools" style="display:none; align-items:center; gap:12px; flex-wrap:wrap;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); cursor:pointer;">
                                <input type="checkbox" class="admin-row-checkbox" id="bagInvSelectAll" onchange="toggleSelectAllBags(this.checked)" style="margin-right:0;"> Select All
                            </label>
                            <button type="button" id="bagInvDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedBags()"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                        </div>
                            <select id="bagInvComponent" class="stats-date-input" onchange="renderBloodInventory()">
                                <option value="All">All Components</option>
                                <option>Whole Blood</option>
                                <option>Red Cells</option>
                                <option>Platelets</option>
                                <option>Plasma</option>
                            </select>
                        </div>
                    </div>
                    <div id="bagInvList"></div>
                </div>
            </section>

            <section id="page-bloodstorage" class="page-view">
                <div class="about-card">
                    <p class="about-hero" style="margin:0; text-align:left;"><i class="fa-solid fa-snowflake" style="color:var(--primary-red);"></i> BLOOD STORAGE</p>
                    <div class="bs-sub" style="margin-bottom:14px;">Where the blood of each donor is kept: refrigerator, freezer or platelet agitator, and which shelf.</div>
                    <div class="bs-toolbar"><button type="button" class="bs-btn red" onclick="openStorageUnitModal()"><i class="fa-solid fa-plus"></i> ADD STORAGE UNIT</button></div>
                    <input type="text" id="bsSearch" class="bs-search" placeholder="Search donor name, blood type, bag ID" oninput="renderBloodStorage()">
                    <div id="bloodStorageUnits"></div>
                </div>
            </section>

            <section id="page-expiryalert" class="page-view">
                <div class="about-card">
                    <p class="about-hero" style="margin:0; text-align:left;"><i class="fa-solid fa-triangle-exclamation" style="color:var(--primary-red);"></i> EXPIRATION ALERT</p>
                    <div class="bs-sub" style="margin-bottom:14px;">Shelf life: Whole Blood 35 days, Red Cells 42 days, Platelets 5 days, Plasma 365 days. Red means it must be disposed.</div>
                    <div class="bs-toolbar">
                        <button type="button" class="req-btn no" id="disposeExpiredBtn" style="display:none;" onclick="disposeAllExpiredBags()"><i class="fa-solid fa-trash"></i> Dispose All Expired</button>
                    </div>
                    <input type="text" id="eaSearch" class="bs-search" placeholder="Search donor name, blood type, bag ID" oninput="renderExpiryAlert()">
                    <div id="expiryAlertSections"></div>
                </div>
            </section>

            <section id="page-bloodtransfer" class="page-view">
                <div class="about-card">
                    <div class="bs-head">
                        <div>
                            <p class="about-hero" style="margin:0; text-align:left;"><i class="fa-solid fa-truck-medical" style="color:var(--primary-red);"></i> BLOOD TRANSFER</p>
                            <div class="bs-sub" style="margin-bottom:14px;">Blood bags sent to another hospital or place.</div>
                        </div>
                        <div class="bs-head-btns"><button type="button" class="bs-btn red" onclick="openTransferModal('hospital')"><i class="fa-solid fa-plus"></i> NEW TRANSFER</button></div>
                    </div>
                    <div class="bs-toolbar-row">
                        <input type="text" id="btSearch" class="bs-search" placeholder="Search hospital / place, blood type, bag ID" oninput="renderTransfers()">
                        <label class="bs-selectall"><input type="checkbox" class="admin-row-checkbox" id="btSelectAll" onchange="toggleSelectAllTransfers('hospital', this.checked)" style="margin-right:0;"> Select All</label>
                        <button type="button" id="btDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedTransfers('hospital')"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                    </div>
                    <div id="btList"></div>
                </div>
            </section>

            <section id="page-patientrelease" class="page-view">
                <div class="about-card">
                    <div class="bs-head">
                        <div>
                            <p class="about-hero" style="margin:0; text-align:left;"><i class="fa-solid fa-hand-holding-medical" style="color:var(--primary-red);"></i> PATIENT BLOOD RELEASE</p>
                            <div class="bs-sub" style="margin-bottom:14px;">Who received the blood: patient name, case (e.g. accident) and hospital or ward.</div>
                        </div>
                        <div class="bs-head-btns"><button type="button" class="bs-btn red" onclick="openTransferModal('patient')"><i class="fa-solid fa-plus"></i> NEW RELEASE</button></div>
                    </div>
                    <div class="bs-toolbar-row">
                        <input type="text" id="prSearch" class="bs-search" placeholder="Search patient name, blood type, reason, bag ID" oninput="renderTransfers()">
                        <label class="bs-selectall"><input type="checkbox" class="admin-row-checkbox" id="prSelectAll" onchange="toggleSelectAllTransfers('patient', this.checked)" style="margin-right:0;"> Select All</label>
                        <button type="button" id="prDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedTransfers('patient')"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                    </div>
                    <div id="prList"></div>
                </div>
            </section>

            <section id="page-approvals" class="page-view">
                <div style="background:var(--card-bg); padding:25px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid var(--border-color);">
                    <h2 style="color:var(--primary-red); margin-bottom:15px; text-align:center;"><i class="fa-solid fa-user-check"></i> User Verification</h2>
                    <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:14px;">Approve or reject Staff Account sign-up requests.</p>
                    <div id="adminApprovalPageViewList" class="approval-table-wrapper">

                    </div>
                </div>
            </section>

            <section id="page-userslog" class="page-view">
                <div style="background:var(--card-bg); padding:25px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid var(--border-color);">
                    <h2 style="color:var(--primary-red); margin-bottom:15px; text-align:center;"><i class="fa-solid fa-users-rectangle"></i> Users Log</h2>
                    <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:14px;">List of all registered Staff and Admin accounts in the system.</p>
                    <div id="usersBulkBar" class="admin-bulk-bar">
                        <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); cursor:pointer;">
                            <input type="checkbox" class="admin-row-checkbox" id="usersSelectAll" onchange="toggleSelectAllUsers(this.checked)" style="margin-right:0;"> Select All
                        </label>
                        <button id="usersDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedUsers()"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                    </div>
                    <div id="usersLogContainer" style="display:flex; flex-direction:column; gap:12px;">

                    </div>
                </div>
            </section>

            <section id="page-auditlog" class="page-view">
                <div style="background:var(--card-bg); padding:25px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid var(--border-color);">
                    <h2 style="color:var(--primary-red); margin-bottom:15px; text-align:center;"><i class="fa-solid fa-shield-halved"></i> Audit Log</h2>
                    <p style="text-align:center; color:var(--text-muted); margin-bottom:20px; font-size:14px;">Record every Change, Create, Update, Delete, and Export, of donor records and masterlists.</p>
                    <div class="audit-search-box">
                        <div class="audit-search-row">
                            <input type="text" id="auditSearchInput" class="bs-search audit-search-input" placeholder="Search staff, donor, date, or what was edited..." oninput="debouncedRenderAuditLog()" autocomplete="off">
                            <select id="auditSearchField" class="bs-search audit-search-select" onchange="renderAuditLogView()" aria-label="Search in">
                                <option value="all">Search in: All</option>
                                <option value="staff">Staff / User</option>
                                <option value="donor">Donor</option>
                                <option value="action">Action</option>
                                <option value="changes">What was edited</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                    </div>
                    <div class="admin-bulk-bar" id="auditLogBulkBar" style="justify-content:center; gap:24px;">
                        <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); cursor:pointer;">
                            <input type="checkbox" class="admin-row-checkbox" id="auditLogSelectAll" onchange="toggleSelectAllAuditLog(this.checked)" style="margin-right:0;"> Select All
                        </label>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button id="auditLogDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedAuditLogEntries()"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                        </div>
                    </div>
                    <div id="auditLogContainer" style="display:flex; flex-direction:column; gap:12px;">

                    </div>
                </div>
            </section>

            <section id="page-settings" class="page-view">
                <div class="change-pass-container">
                    <h2>Change Password</h2>

                    <div id="cp-step-1" class="cp-step active">
                        <p class="cp-help">For your security, we first send a 6-digit verification code to your email address. Enter your email address below, then tap Send Code.</p>
                        <div class="form-group-custom">
                            <label>EMAIL ADDRESS</label>
                            <input type="email" id="cpEmailInput" placeholder="Enter your email address" autocomplete="email">
                        </div>
                        <button type="button" class="action-main-btn" id="cpSendCodeBtn" onclick="cpSendCode()">Send Code</button>
                    </div>

                    <div id="cp-step-2" class="cp-step">
                        <p class="cp-help" id="cpEmailTargetText">Check your email for the 6-digit code.</p>
                        <div class="fp-otp-container">
                            <input type="text" maxlength="1" class="fp-otp-input cp-otp" inputmode="numeric">
                            <input type="text" maxlength="1" class="fp-otp-input cp-otp" inputmode="numeric">
                            <input type="text" maxlength="1" class="fp-otp-input cp-otp" inputmode="numeric">
                            <input type="text" maxlength="1" class="fp-otp-input cp-otp" inputmode="numeric">
                            <input type="text" maxlength="1" class="fp-otp-input cp-otp" inputmode="numeric">
                            <input type="text" maxlength="1" class="fp-otp-input cp-otp" inputmode="numeric">
                        </div>
                        <p class="fp-otp-subtext">Didn't receive the code? <button type="button" class="otp-resend-btn" onclick="cpResendCode(this)">Resend</button></p>
                        <div class="cp-btn-row">
                            <button type="button" class="cp-btn-back" onclick="goToCpStep(1)">Back</button>
                            <button type="button" class="action-main-btn" onclick="cpVerifyCode()">Verify</button>
                        </div>
                    </div>

                    <div id="cp-step-3" class="cp-step">
                        <div class="password-guide">Password must be at least 8 characters with numbers &amp; symbols.</div>
                        <form onsubmit="event.preventDefault(); validateAndChangePassword();">
                            <div class="form-group-custom">
                                <label>EMAIL ADDRESS</label>
                                <input type="email" id="cpEmailShown" placeholder="Enter your email address" autocomplete="email">

                            </div>
                            <div class="form-group-custom">
                                <label>Current Password</label>
                                <div class="password-input-wrap">
                                    <input type="password" id="currentPassInput" placeholder="Enter Current Password">
                                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('currentPassInput', this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                                </div>
                            </div>
                            <div class="form-group-custom">
                                <label>New Password</label>
                                <div class="password-input-wrap">
                                    <input type="password" id="newPassInput" placeholder="Enter New Password">
                                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('newPassInput', this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                                </div>
                            </div>
                            <div class="form-group-custom">
                                <label>Confirm New Password</label>
                                <div class="password-input-wrap">
                                    <input type="password" id="confirmPassInput" placeholder="Confirm New Password">
                                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('confirmPassInput', this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                                </div>
                            </div>
                            <div class="cp-btn-row">
                                <button type="button" class="cp-btn-back" onclick="resetChangePasswordFlow()">Cancel</button>
                                <button type="submit" class="action-main-btn">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <section id="page-profile" class="page-view">
                <div class="profile-container" id="profile-container-box">

                </div>
            </section>

            <section id="page-create-history-form" class="page-view">
                <div style="background:var(--card-bg); border-radius:12px; padding:30px; max-width:600px; margin:20px auto; box-shadow:0 4px 15px rgba(0,0,0,0.08); border:1px solid var(--border-color);">
                    <div style="color:var(--primary-red); font-size:22px; font-weight:bold; text-align:center; margin-bottom:25px; text-transform:uppercase; letter-spacing:0.5px;">Create Donor History Record</div>
                    <input type="hidden" id="history_form_donorId" value="">
                    <input type="hidden" id="history_form_pendingReqId" value="">

                    <div style="display:grid; grid-template-columns: 150px 1fr; gap:15px; align-items:center; margin-bottom:16px;">
                        <label style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;">Donor's Name:</label>
                        <input type="text" id="history_form_name" style="width:100%; padding:12px; border:1px solid var(--border-color); border-radius:6px; font-size:15px; font-weight:bold; outline:none; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 150px 1fr; gap:15px; align-items:center; margin-bottom:16px;">
                        <label style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;">Location:</label>
                        <input type="text" id="history_form_location" style="width:100%; padding:12px; border:1px solid var(--border-color); border-radius:6px; font-size:15px; font-weight:bold; outline:none; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 150px 1fr; gap:15px; align-items:center; margin-bottom:16px;">
                        <label style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;">Blood Type:</label>
                        <select id="history_form_bloodType" style="width:100%; padding:12px; border:1px solid var(--border-color); border-radius:6px; font-size:15px; font-weight:bold; outline:none; background:var(--input-bg); color:var(--text-dark);">
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns: 150px 1fr; gap:15px; align-items:center; margin-bottom:16px;">
                        <label style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;">New Donation:</label>
                        <input type="date" id="history_form_newDonation" min="1900-01-01" max="9999-12-31" oninput="clampDateYear4(this)" onblur="validateDonationDateField(this, 'New Donation')" style="width:100%; padding:12px; border:1px solid var(--border-color); border-radius:6px; font-size:15px; font-weight:bold; outline:none; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                                        <div style="display:grid; grid-template-columns: 150px 1fr; gap:15px; align-items:center; margin-bottom:16px;">
                        <label style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;">Times Donated:</label>
                        <input type="text" id="history_form_times" inputmode="numeric" oninput="this.dataset.touched = '1'" style="width:100%; padding:12px; border:1px solid var(--border-color); border-radius:6px; font-size:15px; font-weight:bold; outline:none; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 150px 1fr; gap:15px; align-items:center; margin-bottom:16px;">
                        <label style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px; text-transform:uppercase;">Amounts:</label>
                        <input type="text" id="history_form_amount" value="1 Bag" style="width:100%; padding:12px; border:1px solid var(--border-color); border-radius:6px; font-size:15px; font-weight:bold; outline:none; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                                        <div style="display:flex; gap:15px;">
                        <button type="button" onclick="cancelCreateHistoryForm()" style="flex:1; padding:14px; background-color:var(--primary-red); color:white; border:none; border-radius:6px; font-size:16px; font-weight:bold; cursor:pointer;">Cancel</button>
                        <button id="historyFormSubmitBtn" onclick="approveAndCommitHistoryRecord(this)" style="flex:1; padding:14px; background-color:var(--primary-blue); color:white; border:none; border-radius:6px; font-size:16px; font-weight:bold; cursor:pointer;">Create</button>
                    </div>
                </div>
            </section>

            <section id="page-single-record" class="page-view">
                <div style="background:var(--card-bg); border-radius:12px; padding:30px; max-width:700px; margin:20px auto; box-shadow:0 4px 15px rgba(0,0,0,0.08); border:1px solid var(--border-color);">
                    <div style="background:#000; color:#fff; padding:15px; text-align:center; font-size:18px; font-weight:bold; border-radius:6px; margin-bottom:25px;">Donation History Record</div>

                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">DONOR'S NAME:</div>
                        <div id="detail_name" style="font-weight:bold;">Maria Balon Santos</div>
                        <input id="detail_name_edit" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">LOCATION:</div>
                        <div id="detail_location" style="font-weight:bold;">N/A</div>
                        <input id="detail_location_edit" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">BLOOD TYPE:</div>
                        <div id="detail_bloodType" style="font-weight:bold;">A+</div>
                        <select id="detail_bloodType_edit" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">NEW DONATION:</div>
                        <div id="detail_newDonation">August 18, 2026</div>
                        <input type="date" id="detail_newDonation_edit" min="1900-01-01" onblur="validateDonationDateField(this, 'New Donation')" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">LAST DONATION:</div>
                        <div id="detail_lastDonation">N/A</div>
                        <input type="date" id="detail_lastDonation_edit" min="1900-01-01" onblur="validateDonationDateField(this, 'Last Donation')" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">TIMES DONATED:</div>
                        <div id="detail_timesDonated">1</div>
                        <input type="number" min="0" id="detail_timesDonated_edit" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:15px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">AMOUNTS:</div>
                        <div id="detail_amount">1 Bag</div>
                        <input id="detail_amount_edit" style="display:none; width:100%; padding:10px; border:1px solid var(--border-color); border-radius:6px; font-size:14px; font-weight:bold; background:var(--input-bg); color:var(--text-dark);">
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:25px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">CREATED BY:</div>
                        <div id="detail_createdBy">Unknown</div>
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:25px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">CREATED ON:</div>
                        <div id="detail_createdAt">N/A</div>
                    </div>
                    <div style="display:grid; grid-template-columns: 180px 1fr; gap:15px; align-items:center; margin-bottom:25px; font-size:14px; color:var(--text-dark); border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <div style="font-weight:bold; color:var(--text-muted); font-size:12px; letter-spacing:0.5px;">STATUS:</div>
                        <div id="detail_status"><span class="rec-status approved">Approved</span></div>
                    </div>

                    <div id="recordViewButtons">
                        <button id="recordEditBtn" onclick="enterRecordEditMode()" style="width:100%; padding:14px; background-color:#222; color:white; border:none; border-radius:6px; font-size:15px; font-weight:bold; cursor:pointer; margin-bottom:10px;"><i class="fa-solid fa-pen"></i> Edit Record</button>
                        <button onclick="switchMainPage('history', document.querySelectorAll('.bottom-nav-item')[2])" style="width:100%; padding:14px; background-color:var(--primary-blue); color:white; border:none; border-radius:6px; font-size:15px; font-weight:bold; cursor:pointer;"><i class="fa-solid fa-arrow-left"></i> Back to History Records</button>
                    </div>
                    <div id="recordEditButtons" style="display:none; gap:12px;">
                        <button onclick="cancelRecordEditMode()" style="flex:1; padding:14px; background-color:var(--primary-red); color:white; border:none; border-radius:6px; font-size:15px; font-weight:bold; cursor:pointer;">Cancel</button>
                        <button id="saveRecordEditBtn" onclick="saveRecordEdit()" style="flex:1; padding:14px; background-color:var(--primary-blue); color:white; border:none; border-radius:6px; font-size:15px; font-weight:bold; cursor:pointer;">Save Changes</button>
                    </div>
                </div>

                <div style="background:var(--card-bg); border-radius:12px; padding:25px 30px; max-width:700px; margin:20px auto; box-shadow:0 4px 15px rgba(0,0,0,0.08); border:1px solid var(--border-color);">
                    <div style="border:2px solid var(--text-dark); border-radius:6px; padding:14px; text-align:center; font-size:17px; font-weight:bold; letter-spacing:0.5px; margin-bottom:10px; color:var(--text-dark);">LAST DONATION TRANSACTION</div>
                    <div id="lastDonationTransactionList"></div>
                </div>
            </section>

            <section id="page-about" class="page-view">
                <div class="about-tabs">
                    <button class="about-tab-btn active" data-ptab="privacy" onclick="loadPolicyTab('privacy')"><i class="fa-solid fa-user-shield"></i> Privacy Policy</button>
                    <button class="about-tab-btn" data-ptab="terms" onclick="loadPolicyTab('terms')"><i class="fa-solid fa-file-contract"></i> Terms &amp; Conditions</button>
                    <button class="about-tab-btn" data-ptab="legal" onclick="loadPolicyTab('legal')"><i class="fa-solid fa-scale-balanced"></i> Legal Policy Bases</button>
                    <button class="about-tab-btn" data-ptab="about" onclick="loadPolicyTab('about')"><i class="fa-solid fa-circle-info"></i> About REDFLOW System</button>
                </div>
                <div id="aboutSubPanel" class="about-subpanel active">
                    <div class="about-card">
<p class="about-hero">REDFLOW: A COMMUNITY BLOOD DONATION BLOOD TYPES DIGITAL MASTER LIST IN IROSIN</p>
<div class="about-section" data-policy="about">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> About REDFLOW</h3>
<p>REDFLOW: A Community Blood Donation Blood Types Digital Master List in Irosin is a digital information and coordination system designed to support the organized management of voluntary blood donor information within the Municipality of Irosin. The system is intended to help authorized personnel maintain a centralized and organized digital master list containing relevant donor information, particularly blood type and location-related information that may assist in identifying potential donors when a legitimate blood donation need arises.</p>
<p>The primary purpose of REDFLOW is to improve the organization, accessibility, and management of blood donor information. Instead of relying entirely on handwritten records, scattered documents, or manually maintained lists, REDFLOW provides an organized digital environment where authorized users can manage donor records more efficiently.</p>
<p>REDFLOW is designed as a support and information-management system. It does not function as a blood bank, blood collection center, laboratory, hospital, or medical facility. It does not collect, store, test, process, transport, sell, or transfuse blood. It also does not independently determine whether a person is medically qualified to donate blood. Medical screening, blood typing confirmation, compatibility testing, donor eligibility assessment, blood collection, storage, and transfusion remain the responsibility of qualified healthcare professionals and authorized blood-service facilities.</p>
<p>The system may assist authorized personnel in locating or identifying potentially suitable registered donors based on information available in the master list. Any final decision concerning donor eligibility, blood compatibility, medical suitability, or actual blood donation must be verified by authorized healthcare personnel.</p>
<p>The scope of REDFLOW is intended to focus on the community of Irosin. The system may contain information such as a donor's name or identification reference, blood type, contact information where legitimately required, location or barangay, availability status, verification status, and other information necessary for the declared purpose of the system. Only information that is necessary and appropriate for the stated purpose should be collected.</p>
<p>REDFLOW seeks to support voluntary blood donation and community coordination while respecting the privacy, dignity, safety, and rights of every person whose information is included in the system.</p>
</div>
<div class="about-section" data-policy="about">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Our Purpose</h3>
<p>REDFLOW is intended to provide an organized digital master list that can help authorized personnel:</p>
<ul class="about-list">
  <li>Maintain an organized record of registered and verified potential blood donors.</li>
  <li>Search donor records using appropriate blood-type information.</li>
  <li>Identify potential donors within the intended service area.</li>
  <li>Manage donor availability and verification status.</li>
  <li>Reduce duplication and confusion in manually maintained donor records.</li>
  <li>Support faster coordination between authorized personnel and potential donors.</li>
  <li>Maintain appropriate records for administrative and community blood-donation coordination.</li>
  <li>Promote awareness of voluntary blood donation.</li>
  <li>Support authorized healthcare personnel without replacing their professional judgment.</li>
</ul>
<p>The system is not intended to guarantee that a listed donor will be available, medically eligible, or compatible at the time of an actual blood-donation request.</p>
</div>
<div class="about-section" data-policy="legal">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Legal and Policy Basis</h3>
<p>REDFLOW recognizes the importance of complying with applicable Philippine laws, regulations, institutional policies, and ethical requirements.</p>
<h4 class="about-h3">Republic Act No. 10173 — Data Privacy Act of 2012</h4><p>Republic Act No. 10173, also known as the Data Privacy Act of 2012, protects individual personal information and establishes rules for the lawful processing of personal data. The law requires personal information processing to observe the principles of transparency, legitimate purpose, and proportionality. It also provides rules concerning lawful processing, sensitive personal information, security, accountability, and the rights of data subjects.</p>
<p>Because REDFLOW may process information relating to a person's health or blood type, the system must treat such information with appropriate care and safeguards. The Data Privacy Act identifies information about an individual's health as sensitive personal information, subject to the applicable requirements of the law.</p>
<p>REDFLOW therefore commits to collecting and processing information only for declared and legitimate purposes and only to the extent reasonably necessary for those purposes.</p>

<h4 class="about-h3">Republic Act No. 7719 — National Blood Services Act of 1994</h4><p>Republic Act No. 7719, also known as the National Blood Services Act of 1994, promotes voluntary blood donation and provides a legal framework for maintaining an adequate and safe blood supply. It recognizes voluntary blood donation as a humanitarian act and establishes standards concerning blood banks, blood collection units, and blood-related services.</p>
<p>REDFLOW supports the general objective of encouraging voluntary blood donation, but it does not replace the medical and regulatory functions established under RA 7719. Blood collection and related clinical procedures must be performed by authorized facilities and qualified personnel.</p>

<h4 class="about-h3">Republic Act No. 10173 and the Data Privacy Principles</h4>
<p>The Implementing Rules and Regulations of RA 10173 emphasize transparency, legitimate purpose, and proportionality. They also require that personal data be collected for a declared, specified, and legitimate purpose and that unnecessary or excessive information not be collected.</p>
<p>REDFLOW applies these principles to its donor master list and administrative processes.</p>
</div>
<div class="about-section" data-policy="privacy">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Privacy Policy</h3>
<h4 class="about-h3">Privacy Commitment</h4>
<p>REDFLOW respects the privacy of individuals whose information is collected, recorded, stored, or processed through the system. Personal information shall not be collected merely because it is technically possible to collect it. Information must have a clear connection to the legitimate purpose of REDFLOW.</p>
<p>The system shall implement reasonable organizational, physical, and technical safeguards appropriate to the nature of the information being processed.</p>
<h4 class="about-h3">Information We May Collect</h4>
<p>Depending on the approved system design and legitimate operational requirements, REDFLOW may process information such as:</p>
<ul class="about-list">
  <li>Full name or authorized identification information.</li>
  <li>Blood type.</li>
  <li>Barangay or general location.</li>
  <li>Contact information when necessary for legitimate coordination.</li>
  <li>Donor availability status.</li>
  <li>Donor verification status.</li>
  <li>Donation-related administrative information.</li>
  <li>Account credentials required for authorized system access.</li>
  <li>System activity or audit information.</li>
  <li>Other information specifically approved as necessary for the project.</li>
</ul>
<p>REDFLOW should avoid collecting information that is unnecessary for its declared purpose.</p>
<h4 class="about-h3">Blood Type and Health-Related Information</h4>
<p>Blood type and other health-related information must be handled carefully. REDFLOW does not independently verify medical eligibility unless such verification is performed by authorized healthcare personnel.</p>
<p>A blood type appearing in the digital master list should not automatically be treated as a final medical determination for transfusion purposes. Healthcare professionals must perform the appropriate verification and clinical procedures before blood donation or transfusion.</p>
<h4 class="about-h3">Purpose of Data Processing</h4>
<p>Information may be processed for legitimate purposes such as:</p>
<ul class="about-list">
  <li>Maintaining the donor master list.</li>
  <li>Identifying potential donors.</li>
  <li>Managing donor records.</li>
  <li>Supporting authorized blood-donation coordination.</li>
  <li>Confirming registration or verification status.</li>
  <li>Communicating legitimate donation-related information.</li>
  <li>Generating administrative reports.</li>
  <li>Improving the organization and management of the system.</li>
  <li>Meeting applicable legal, institutional, or research requirements.</li>
</ul>
<p>Personal information shall not be processed for unrelated purposes without an appropriate lawful basis.</p>
<h4 class="about-h3">Transparency</h4>
<p>Users and data subjects should be informed about what information is collected, why it is collected, how it is used, who may access it, how long it may be retained, and how they may exercise their applicable rights.</p>
<p>The information provided through the privacy notice should be understandable and accessible. The NPC's own privacy policy similarly emphasizes explaining the nature and purpose of processing and following transparency, legitimate purpose, and proportionality.</p>
<h4 class="about-h3">Data Minimization</h4>
<p>REDFLOW shall follow the principle that only information reasonably necessary for the declared purpose should be collected.</p>
<p>The system should not collect unnecessary personal information simply for convenience or future use.</p>
<h4 class="about-h3">Data Accuracy</h4>
<p>Reasonable measures should be taken to maintain accurate and updated records. If a donor's information changes, authorized personnel should have an appropriate process for correcting or updating the record.</p>
<p>Incorrect or outdated information should not knowingly be used when it could affect legitimate blood-donation coordination.</p>
<h4 class="about-h3">Data Security</h4>
<p>REDFLOW shall implement appropriate safeguards, which may include:</p>
<ul class="about-list">
  <li>Authorized account access.</li>
  <li>Password protection.</li>
  <li>Role-based access.</li>
  <li>Administrative controls.</li>
  <li>Secure database management.</li>
  <li>Audit logs where appropriate.</li>
  <li>Restricted access to sensitive records.</li>
  <li>Secure handling of uploaded documents.</li>
  <li>Regular review of user permissions.</li>
  <li>Secure deletion or disposal when retention is no longer necessary.</li>
</ul>
<p>Security measures should be appropriate to the risks associated with the information processed.</p>
<h4 class="about-h3">Access to Information</h4>
<p>Access to donor information shall be limited to authorized users whose responsibilities require access to the information.</p>
<p>Not every user should automatically have access to the complete donor master list.</p>
<p>For example, an administrator may have broader management privileges, while another authorized staff member may have access only to information necessary for his or her assigned task.</p>
<h4 class="about-h3">Disclosure of Information</h4>
<p>REDFLOW shall not disclose personal information to unauthorized individuals.</p>
<p>Information may only be disclosed when there is an appropriate lawful basis, authorization, legitimate operational need, or legal requirement.</p>
<p>Where information must be shared with another organization or authorized third party, appropriate privacy and security safeguards should be established.</p>
<p>The Data Privacy Act places accountability on the personal information controller for information under its control, including information transferred to third parties for processing.</p>
<h4 class="about-h3">Data Retention</h4>
<p>Personal information should not be retained indefinitely merely because it has already been collected.</p>
<p>Records should be retained only for as long as necessary for the declared purpose, applicable legal requirements, approved research requirements, institutional policies, or legitimate claims.</p>
<p>When retention is no longer necessary, information should be securely deleted, destroyed, anonymized, or otherwise disposed of according to the approved data-retention and disposition procedure.</p>
<h4 class="about-h3">Data Breach and Security Incident</h4>
<p>If a suspected unauthorized access, disclosure, loss, alteration, or other security incident occurs, the responsible personnel should follow the organization's approved incident-response procedure.</p>
<p>The incident should be documented, assessed, contained, and addressed according to applicable law, institutional policy, and Data Privacy Act requirements.</p>
<h4 class="about-h3">Data Subject Rights</h4>
<p>Subject to applicable law and limitations, data subjects may have rights concerning their personal information, including rights relating to being informed, accessing information, correcting inaccurate information, objecting to certain processing, and other rights recognized by the Data Privacy Act.</p>
<p>Requests concerning personal information should be handled through the designated privacy or system administrator according to the organization's approved procedure.</p>
<h4 class="about-h3">Children's and Minors' Information</h4>
<p>If REDFLOW processes information involving minors, additional safeguards and appropriate consent or authorization requirements must be considered.</p>
<p>The system should not assume that ordinary user registration is sufficient for the processing of a minor's sensitive personal information.</p>
<p>Any collection involving minors should follow applicable law, institutional requirements, and guidance from the appropriate privacy and research authorities.</p>
</div>
<div class="about-section" data-policy="terms">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Terms and Conditions</h3>
<h4 class="about-h3">Acceptance of the Terms</h4>
<p>By using REDFLOW, an authorized user acknowledges that he or she has read and understood the applicable Terms and Conditions, Privacy Policy, and User Agreement.</p>
<p>Use of the system is subject to the user's authorized role and the rules established by the system administrator and responsible institution.</p>
<h4 class="about-h3">Authorized Use</h4>
<p>REDFLOW may only be used for legitimate purposes connected with blood-donation coordination, donor information management, administration, research or approved institutional activities.</p>
<p>Users must not use the system for personal, commercial, discriminatory, fraudulent, or unauthorized purposes.</p>
<h4 class="about-h3">Prohibited Activities</h4>
<p>Users must not:</p>
<ul class="about-list">
  <li>Access another person's account without authorization.</li>
  <li>View donor information without a legitimate need.</li>
  <li>Copy or download donor information for unauthorized purposes.</li>
  <li>Share donor information through unauthorized channels.</li>
  <li>Sell, publish, or distribute donor information.</li>
  <li>Modify records without authorization.</li>
  <li>Enter knowingly false information.</li>
  <li>Use the system to impersonate another person.</li>
  <li>Attempt to bypass access controls.</li>
  <li>Attempt to obtain information beyond the user's assigned permissions.</li>
  <li>Use the system to make independent medical decisions.</li>
  <li>Represent REDFLOW as a hospital, blood bank, laboratory, or medical service.</li>
  <li>Use REDFLOW as a substitute for emergency medical services.</li>
</ul>
<h4 class="about-h3">Medical Disclaimer</h4>
<p>REDFLOW is an information-management and coordination system. It does not provide medical diagnosis, medical treatment, blood transfusion, blood testing, or professional medical advice.</p>
<p>A donor appearing in the master list does not mean that the donor is automatically eligible to donate.</p>
<p>Blood type information in the system should not be considered sufficient for transfusion compatibility. Appropriate medical testing and professional procedures must be performed by authorized healthcare personnel.</p>
<h4 class="about-h3">Emergency Situations</h4>
<p>REDFLOW should not be considered an emergency-response replacement.</p>
<p>In an actual medical emergency, patients or their representatives should seek immediate assistance from appropriate healthcare facilities and emergency medical professionals.</p>
<h4 class="about-h3">Accuracy of Information</h4>
<p>Although reasonable efforts should be made to maintain accurate records, REDFLOW cannot guarantee that every donor record will always be current.</p>
<p>Donor availability, contact information, location, health condition, and eligibility may change.</p>
<p>Healthcare personnel must verify relevant information before any actual donation or transfusion-related action.</p>
<h4 class="about-h3">System Availability</h4>
<p>REDFLOW may occasionally be unavailable because of maintenance, technical problems, connectivity issues, server problems, security updates, or other circumstances.</p>
<p>The system administrators may temporarily restrict access when necessary to protect system security, donor information, or system integrity.</p>
<h4 class="about-h3">Account Responsibility</h4>
<p>Authorized users are responsible for protecting their account credentials.</p>
<p>Users should not share passwords or allow unauthorized individuals to use their accounts.</p>
<p>Any suspected unauthorized account access should be reported immediately to the responsible administrator.</p>
<h4 class="about-h3">Suspension or Termination</h4>
<p>Access may be suspended or terminated when a user violates the Terms and Conditions, misuses personal information, compromises system security, or uses REDFLOW for an unauthorized purpose.</p>
</div>
<div class="about-section" data-policy="terms">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> User Agreement</h3>
<p>By accessing and using REDFLOW, the user acknowledges and agrees that:</p>
<p>The user will use REDFLOW only for authorized and legitimate purposes.</p>
<p>The user will respect the privacy and confidentiality of donor information.</p>
<p>The user will not disclose, copy, photograph, reproduce, or distribute donor information without appropriate authorization.</p>
<p>The user understands that blood type and other health-related information may require heightened protection.</p>
<p>The user understands that REDFLOW does not determine medical eligibility.</p>
<p>The user understands that appearing in the donor master list does not guarantee availability or eligibility.</p>
<p>The user agrees to provide accurate information when authorized to create or update records.</p>
<p>The user agrees not to manipulate, falsify, or intentionally damage donor records.</p>
<p>The user agrees to protect system credentials and report suspected security incidents.</p>
<p>The user understands that authorized healthcare personnel remain responsible for medical screening, blood typing confirmation, compatibility assessment, collection, storage, and transfusion-related procedures.</p>
<p>The user agrees to comply with applicable Philippine laws, institutional rules, privacy requirements, and REDFLOW policies.</p>
<p>Violation of this User Agreement may result in restriction or termination of system access and may lead to appropriate administrative or legal action where applicable.</p>
</div>
<div class="about-section" data-policy="privacy">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Data Privacy and Security</h3>
<p>REDFLOW recognizes that protecting donor information is an important responsibility.</p>
<p>The system shall apply privacy-by-design principles where appropriate. Access should be limited according to user roles, and sensitive information should not be unnecessarily exposed.</p>
<p>The system may use administrative roles such as:</p>
<p>Administrator — responsible for authorized system management, user management, donor-record management, security controls, and administrative monitoring.</p>
<p>Authorized Staff — may access only the information necessary for assigned duties.</p>
<p>Donor — may be allowed to view or manage permitted information relating to his or her own record, depending on the approved system design.</p>
<p>Where the project is being used for research or academic evaluation, research data should be managed separately and according to the approved research protocol, informed consent documents, institutional requirements, and applicable privacy rules.</p>
</div>
<div class="about-section" data-policy="privacy">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Data Retention and Disposal</h3>
<p>REDFLOW shall establish a documented retention period appropriate to the project's purpose.</p>
<p>When information is no longer necessary, the responsible organization should follow an approved disposal procedure.</p>
<p>Depending on the type of information and applicable requirements, disposal may involve secure deletion, destruction of physical copies, anonymization, or another approved method that prevents unauthorized recovery or further identification.</p>
<p>The Data Privacy Act provides that personal information should generally be retained only for as long as necessary for the purposes for which it was obtained, subject to applicable legal and other recognized exceptions.</p>
</div>
<div class="about-section" data-policy="about">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Important Limitations of REDFLOW</h3>
<p>REDFLOW is not:</p>
<ul class="about-list">
  <li>A hospital.</li>
  <li>A blood bank.</li>
  <li>A blood collection unit.</li>
  <li>A laboratory.</li>
  <li>A blood storage facility.</li>
  <li>A transfusion service.</li>
  <li>A medical diagnostic system.</li>
  <li>A substitute for professional healthcare services.</li>
  <li>A guarantee of blood availability.</li>
  <li>A guarantee of donor eligibility.</li>
  <li>A replacement for medical compatibility testing.</li>
</ul>
<p>REDFLOW is intended to support information management and coordination.</p>
<p>Under RA 7719, blood banks and blood collection units are subject to regulatory requirements, and blood collection activities are connected to authorized facilities and professional standards.</p>
</div>
<div class="about-section" data-policy="terms">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Responsible Use of Blood Type Information</h3>
<p>Blood type information may be useful for identifying potential donors, but it should not be treated as the sole basis for determining whether blood can safely be transfused.</p>
<p>The actual medical decision must be made by qualified healthcare professionals using appropriate procedures and testing.</p>
<p>The REDFLOW master list is therefore a coordination resource rather than a clinical compatibility system.</p>
</div>
<div class="about-section" data-policy="privacy">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Privacy and Confidentiality Statement</h3>
<p>All authorized users of REDFLOW are expected to treat donor information as confidential.</p>
<p>Personal information must not be accessed out of curiosity, shared with friends or unauthorized individuals, posted publicly, or used for purposes unrelated to the approved function of the system.</p>
<p>The fact that an individual is registered as a potential blood donor should not be treated as information that can automatically be published or publicly distributed.</p>
</div>
<div class="about-section" data-policy="legal">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Legal Compliance Statement</h3>
<p>REDFLOW is designed with consideration of applicable Philippine privacy and blood-donation laws, particularly Republic Act No. 10173, the Data Privacy Act of 2012, and Republic Act No. 7719, the National Blood Services Act of 1994.</p>
<p>RA 10173 establishes protections for personal information and requires lawful processing consistent with transparency, legitimate purpose, and proportionality.</p>
<p>RA 7719 promotes voluntary blood donation and establishes standards and regulatory requirements relating to blood services.</p>
<p>These laws should not be interpreted as authorizing REDFLOW to perform activities that legally belong to hospitals, blood banks, blood collection units, laboratories, physicians, medical technologists, nurses, or other authorized healthcare professionals.</p>
</div>
<div class="about-section" data-policy="terms">
<h3 class="about-h2"><i class="fa-solid fa-circle-dot"></i> Acknowledgment</h3>
<p>REDFLOW recognizes that technology can support community blood-donation coordination, but technology must operate within appropriate medical, ethical, legal, and privacy boundaries.</p>
<p>The objective of REDFLOW is to organize information, improve coordination, and support voluntary blood-donation initiatives in Irosin while respecting the privacy and rights of donors and other individuals whose information may be processed.</p>
<p>The system shall prioritize responsible information management, confidentiality, data security, accuracy, authorized access, and appropriate coordination with qualified healthcare personnel.</p>
<p>By using REDFLOW, authorized users acknowledge their responsibility to protect personal information and to use the system only for its declared and legitimate purposes.</p>
</div>
                    </div>
                </div>
                            </section>

            <section id="page-myrequests" class="page-view">
                <div class="about-card">
                    <div class="notif-header-row">
                        <p class="about-hero" id="myRequestsTitle" style="margin:0;">PENDING STATUS</p>
                    </div>
                    <div class="req-tabs" id="myReqTypeTabs"></div>
                    <div class="req-tabs" id="myReqTabs"></div>
                    <div id="myRequestsListContainer"></div>
                </div>
            </section>

            <section id="page-requestsubmitted" class="page-view">
                <div class="about-card">
                    <div class="notif-header-row">
                        <p class="about-hero" style="margin:0;">REQUEST SUBMITTED</p>
                    </div>
                    <div class="bs-sub" style="margin-bottom:12px;">Donor information updates you sent to the Administrator, and whether they were approved.</div>
                    <div class="req-tabs" id="subReqTypeTabs"></div>
                    <div class="req-tabs" id="subReqTabs"></div>
                    <div id="subRequestsListContainer"></div>
                </div>
            </section>

            <section id="page-requests" class="page-view">
                <div class="about-card">
                    <div class="notif-header-row">
                        <p class="about-hero" style="margin:0;">REQUEST MANAGEMENT</p>
                    </div>
                    <div class="req-tabs" id="reqTypeTabs"></div>
                    <div class="req-tabs" id="reqTabs"></div>
                    <div id="requestsListContainer"></div>
                </div>
            </section>

            <section id="page-donorscreening" class="page-view">
                <div class="about-card">
                    <div class="notif-header-row">
                        <p class="about-hero" style="margin:0;">DONOR SCREENING</p>
                    </div>
                    <div class="bs-sub" style="margin-bottom:12px;">New donors wait here. Check the information, change it if something is wrong, then open View Full Form to Approve or Reject.</div>
                    <input type="text" id="dsSearch" class="bs-search" placeholder="Search donor name or blood type" oninput="renderDonorScreening()">
                    <div class="req-tabs" id="dsTypeTabs"></div>
                    <div class="bs-filter-row">
                        <div class="req-tabs" id="dsTabs" style="margin:0;"></div>
                        <div id="dsDeleteTools" style="display:none; align-items:center; gap:12px; flex-wrap:wrap;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); cursor:pointer;">
                                <input type="checkbox" class="admin-row-checkbox" id="dsSelectAll" onchange="toggleSelectAllDs(this.checked)" style="margin-right:0;"> Select All
                            </label>
                            <button type="button" id="dsDeleteBtn" class="admin-bulk-delete-btn" onclick="deleteSelectedDs()"><i class="fa-solid fa-trash"></i> DELETE (0)</button>
                        </div>
                    </div>
                    <div id="dsList"></div>
                </div>
            </section>

            <section id="page-notifications" class="page-view">
                <div class="about-card">
                    <div class="notif-header-row">
                        <p class="about-hero" style="margin:0;">NOTIFICATIONS</p>
                    </div>
                    <div id="notificationsListContainer" class="notif-list-container">

                    </div>
                </div>
            </section>
        </div>

        <nav class="bottom-nav-bar">
            <button class="bottom-nav-item active" data-page="home" onclick="switchMainPage('home', this)">
                <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                <span>Home</span>
            </button>
            <button class="bottom-nav-item" data-page="events" onclick="switchMainPage('events', this)">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                <span>Create</span>
            </button>
            <button class="bottom-nav-item" data-page="history" onclick="switchMainPage('history', this)">
                <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                <span>Record</span>
            </button>
            <button class="bottom-nav-item" data-page="notifications" id="notifNavBtn" onclick="switchMainPage('notifications', this); renderNotificationsView();">
                <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                <span>Notification</span>
                <span class="notif-badge-dot" id="notifBadgeDot" style="display:none;"></span>
            </button>
            <button class="bottom-nav-item" data-page="about" onclick="switchMainPage('about', this); loadPolicyTab('privacy')">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7H2v2z"/></svg>
                <span>Policies</span>
            </button>
        </nav>
    </div>

    <div class="modal-overlay" id="alertBoxModal">
        <div class="modal-box alert-box-card type-info" id="alertBoxCard">
            <div class="alert-box-icon" id="alertBoxIcon"><i class="fa-solid fa-circle-info"></i></div>
            <h3 id="alertBoxTitle">Notice</h3>
            <p id="alertBoxMessage"></p>
            <div class="modal-buttons">
                <button class="modal-btn btn-confirm" style="flex:1;" onclick="closeModal('alertBoxModal')">OK</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="transferModal">
        <div class="modal-box req-modal-box" style="max-height:90vh; overflow-y:auto;">
            <h3 id="trTitle" style="color:var(--primary-red);">Blood Transfer</h3>
            <input type="hidden" id="tr_kind">
            <input type="hidden" id="tr_edit_id">
            <div class="form-group-custom" id="tr_bags_wrap">
                <label style="font-size:11px;">SELECT BLOOD BAG(S) (IN STOCK)</label>
                <input type="text" id="trBagSearch" class="bs-search" style="max-width:none; margin-bottom:6px;" placeholder="Search blood type, component, bag ID, donor" oninput="renderTransferBagList()">
                <div id="trBagList" class="tr-bag-list"></div>
                <div id="trBagCount" style="font-size:12px; color:var(--text-muted); margin-top:4px;">0 selected</div>
            </div>
            <div class="form-group-custom" id="tr_patient_wrap" style="display:none;">
                <label style="font-size:11px;">PATIENT NAME</label>
                <input type="text" id="tr_patient" maxlength="120" placeholder="Full name of the patient">
            </div>
            <div class="form-group-custom">
                <label style="font-size:11px;" id="tr_destination_label">HOSPITAL / PLACE TRANSFERRED TO</label>
                <input type="text" id="tr_destination" maxlength="150" placeholder="e.g. Sorsogon Provincial Hospital">
            </div>
            <div class="form-group-custom" id="tr_reason_wrap" style="display:none;">
                <label style="font-size:11px;">REASON / CASE</label>
                <input type="text" id="tr_reason" maxlength="160" placeholder="e.g. Vehicular accident, surgery, delivery">
            </div>
            <div class="form-group-custom">
                <label style="font-size:11px;">DATE</label>
                <input type="date" id="tr_date">
            </div>
            <div class="form-group-custom">
                <label style="font-size:11px;">REMARKS (OPTIONAL)</label>
                <input type="text" id="tr_remarks" maxlength="500">
            </div>
            <div class="modal-buttons" style="margin-top:14px;">
                <button class="modal-btn btn-cancel" onclick="closeModal('transferModal')">Cancel</button>
                <button class="modal-btn btn-confirm" id="trSaveBtn" onclick="saveTransfer()">Save</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="changeInfoModal">
        <div class="modal-box req-modal-box" style="max-height:90vh; overflow-y:auto;">
            <h3 style="color:var(--primary-red);">Change Donor Information</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px; text-align:center;">Every change is recorded in the Audit Log.</p>
            <input type="hidden" id="ci_requestId">
            <div id="changeInfoBody"></div>
            <div class="modal-buttons" style="margin-top:14px;">
                <button class="modal-btn btn-cancel" onclick="closeModal('changeInfoModal')">Cancel</button>
                <button class="modal-btn btn-confirm" id="ciSaveBtn" onclick="saveChangeInfo()">Save Changes</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="requestViewModal">
        <div class="modal-box req-modal-box">
            <h3 id="requestViewTitle">Request</h3>
            <div id="requestViewBody"></div>
            <div class="modal-buttons" id="requestViewButtons" style="margin-top:14px;">
                <button class="modal-btn btn-cancel" onclick="closeModal('requestViewModal')">Close</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="bloodBagModal">
        <div class="modal-box req-modal-box">
            <h3 style="color:var(--primary-red);">Record Collected Bag</h3>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px; text-align:center;">Only Eligible donors can be recorded. Each record is 1 Bag.</p>
            <div class="form-group-custom">
                <label style="font-size:11px;">BAG ID</label>
                <input type="text" id="bag_code" maxlength="40" placeholder="Bag ID" style="font-weight:bold;" oninput="this.dataset.touched='1'; this.value=this.value.replace(/[^A-Za-z0-9_-]/g,'')">
            </div>
            <div class="form-group-custom">
                <label style="font-size:11px;">BLOOD CENTER</label>
                <input type="text" id="bag_center" maxlength="120" placeholder="Blood Center">
            </div>
            <div class="form-group-custom">
                <label style="font-size:11px;">DONOR</label>
                <input type="text" id="bag_donor_search" maxlength="60" placeholder="&#128269; Search donor name" oninput="filterBagDonors()" style="margin-bottom:6px;">
                <select id="bag_donor"></select>
            </div>
            <div class="form-group-custom">
                <label style="font-size:11px;">BLOOD COMPONENT</label>
                <select id="bag_component" onchange="onBagComponentChange(true)">
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Red Cells">Red Cells</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Plasma">Plasma</option>
                </select>
            </div>
            <div class="bag-date-row">
                <div class="form-group-custom">
                    <label style="font-size:11px;">DATE COLLECTED</label>
                    <input type="date" id="bag_date" onchange="onBagComponentChange(true)">
                </div>
                <div class="form-group-custom">
                    <label style="font-size:11px;">EXPIRATION DATE</label>
                    <input type="date" id="bag_expiry" style="font-weight:bold;" onchange="this.dataset.touched = '1'; bagExpiryEdited()">
                </div>
            </div>
            <div id="bag_expiry_hint" style="font-size:12px; color:var(--text-muted); margin:-6px 0 10px;"></div>
            <div class="form-group-custom">
                <label style="font-size:11px;">COLLECTION RESULT</label>
                <select id="bag_result" onchange="onBagComponentChange()">
                    <option value="Usable">Collected - Usable</option>
                    <option value="Rejected">Collected - Rejected</option>
                </select>
            </div>
            <div class="form-group-custom" id="bag_location_wrap">
                <label style="font-size:11px;">STORAGE LOCATION</label>
                <select id="bag_location" onchange="onBagComponentChange()"></select>
                <input type="text" id="bag_location_other" maxlength="60" placeholder="Please specify storage location" style="display:none; margin-top:6px;">
            </div>
            <div class="form-group-custom" id="bag_shelf_wrap">
                <label style="font-size:11px;">SHELF / SLOT</label>
                <select id="bag_shelf" onchange="onBagComponentChange()">
                    <option value="Shelf 1">Shelf 1</option>
                    <option value="Shelf 2">Shelf 2</option>
                    <option value="Shelf 3">Shelf 3</option>
                    <option value="others">Please Specify</option>
                </select>
                <input type="text" id="bag_shelf_other" maxlength="40" placeholder="Please specify shelf / tray / slot" style="display:none; margin-top:6px;">
            </div>
            <div class="modal-buttons" style="margin-top:14px;">
                <button class="modal-btn btn-cancel" onclick="closeModal('bloodBagModal')">Cancel</button>
                <button class="modal-btn btn-confirm" id="saveBagBtn" onclick="saveBloodBag()">Save Bag</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="storageUnitModal">
        <div class="modal-box req-modal-box">
            <h3 id="storageUnitTitle" style="color:var(--primary-red);">Add Storage Unit</h3>
            <input type="hidden" id="su_id">
            <div class="form-group-custom" id="su_preset_wrap">
                <label style="font-size:11px;">NAME</label>
                <select id="su_preset" onchange="onStoragePresetChange()">
                    <option value="fridge">Refrigerator (2-6 C)</option>
                    <option value="agitator">Platelet Agitator (20-24 C)</option>
                    <option value="freezer">Freezer (-18 C or colder)</option>
                    <option value="others">Please Specify</option>
                </select>
                <div id="su_auto_hint" style="font-size:12px; color:var(--text-muted); margin-top:6px;"></div>
            </div>
            <div class="form-group-custom" id="su_name_wrap" style="display:none;">
                <label style="font-size:11px;" id="su_name_label">SPECIFY NAME</label>
                <input type="text" id="su_name" maxlength="60" placeholder="eg. Refrigerator 1, Freezer 1, or Platelets Agitator 1">
            </div>
            <div class="form-group-custom" id="su_kind_wrap">
                <label style="font-size:11px;">TYPE</label>
                <select id="su_kind" onchange="onStorageKindChange()">
                    <option value="fridge">Refrigerator</option>
                    <option value="freezer">Freezer</option>
                    <option value="agitator">Platelet Agitator</option>
                </select>
            </div>
            <div class="form-group-custom" id="su_temp_wrap">
                <label style="font-size:11px;">TEMPERATURE</label>
                <input type="text" id="su_temp" maxlength="40" placeholder="e.g. 2-6 C">
            </div>
            <div class="modal-buttons" style="margin-top:14px;">
                <button class="modal-btn btn-cancel" onclick="closeModal('storageUnitModal')">Cancel</button>
                <button class="modal-btn btn-confirm" onclick="saveStorageUnit()">Save</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="logoutModal">
        <div class="modal-box">
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>
            <div class="modal-buttons">
                <button class="modal-btn btn-cancel" onclick="closeModal('logoutModal')">Cancel</button>
                <button class="modal-btn btn-confirm" onclick="confirmLogout()">Okay</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="bloodTypeConfirmModal">
        <div class="modal-box">
            <h3>Confirm Blood Type</h3>
            <p id="bloodTypeConfirmMessage">Are you sure this is correct?</p>
            <div class="modal-buttons">
                <button class="modal-btn btn-cancel" onclick="closeModal('bloodTypeConfirmModal')">Cancel</button>
                <button class="modal-btn btn-confirm" onclick="confirmBloodTypeAndProceed()">Okay</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="exportPasswordModal">
        <div class="modal-box export-modal-box">
            <h3>Export Donor Masterlist</h3>
            <p class="export-modal-text" id="exportModalText">Enter your Gmail address. We will send a 6-digit verification code to it.</p>
            <div id="exportEmailStep" class="export-password-wrap">
                <input type="email" id="exportEmailInput" placeholder="Enter your Gmail address" autocomplete="email" autocapitalize="off" onkeydown="if(event.key==='Enter'){submitExportStep();}">
            </div>
            <div id="exportOtpStep" class="export-password-wrap" style="display:none;">
                <input type="text" id="exportOtpInput" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit code" autocomplete="one-time-code" onkeydown="if(event.key==='Enter'){submitExportStep();}">
                <a class="export-resend-link" id="exportResendBtn" onclick="resendExportOtp()">Resend code</a>
            </div>
            <div id="exportPasswordStep" class="password-input-wrap export-password-wrap" style="display:none;">
                <input type="password" id="exportPasswordInput" name="export-confirm-secret" placeholder="Enter your password" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly')" onkeydown="if(event.key==='Enter'){submitExportStep();}">
                <button type="button" class="toggle-password" aria-label="Show or hide password" onclick="togglePasswordVisibility('exportPasswordInput', this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            </div>
            <div id="exportModalMessage" class="export-modal-message" style="display:none;"></div>
            <div class="modal-buttons">
                <button type="button" class="modal-btn btn-cancel" onclick="closeExportPasswordModal()">Cancel</button>
                <button type="button" class="modal-btn btn-confirm" id="exportSubmitBtn" onclick="submitExportStep()">Send Code</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="genericConfirmModal">
        <div class="modal-box" id="genericConfirmCard">
            <div class="alert-box-icon" id="genericConfirmIcon" style="display:none;"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h3 id="genericConfirmTitle">Please Confirm</h3>
            <p id="genericConfirmMessage">Are you sure?</p>
            <div class="modal-buttons">
                <button class="modal-btn btn-cancel" onclick="closeModal('genericConfirmModal')">Cancel</button>
                <button class="modal-btn btn-confirm" id="genericConfirmOkBtn" onclick="">Okay</button>
            </div>
        </div>
    </div>
