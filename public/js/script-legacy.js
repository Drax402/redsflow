
        const APP_PUBLIC_BASE = (function () {
            const sc = document.currentScript;
            if (sc && sc.src) { return sc.src.replace(/js\/script-legacy\.js.*$/, ''); }
            return '/';
        })();
        const PICTURE_FALLBACK = APP_PUBLIC_BASE + 'images/picture.jpg';
        const AVATAR_DIR = APP_PUBLIC_BASE + 'images/avatars/';
        const AVATAR_CHOICES = ['Male.jpg', 'Female.jpg'];
        function defaultAvatarForSex(sex) {
            return AVATAR_DIR + (String(sex || '').toLowerCase() === 'female' ? 'Female.jpg' : 'Male.jpg');
        }
        function isPlaceholderAvatar(src) {
            return !src || src === 'picture.jpg' || String(src).endsWith('/picture.jpg') || String(src).endsWith('/Boy.jpg') || String(src).endsWith('/Girl.jpg') || String(src).endsWith('/Man.jpg') || String(src).endsWith('/Woman.jpg');
        }
        function donorAvatarSrc(donor) {
            if (donor && !isPlaceholderAvatar(donor.avatar)) return donor.avatar;
            return defaultAvatarForSex(donor && (donor.sex || donor.gender));
        }
        function getUserAvatar(user) {
            if (!user) return PICTURE_FALLBACK;
            try {
                const custom = localStorage.getItem('redflow_avatar_' + user.id);
                if (custom) return custom;
            } catch (e) {}
            if (!isPlaceholderAvatar(user.faceDoc)) return user.faceDoc;
            return defaultAvatarForSex(user.gender || user.sex);
        }
        function refreshHeaderAvatar() {
            const img = document.getElementById('headerAvatarImg');
            const me = safeParseJSON('redflow_current_user');
            if (img && me) img.src = getUserAvatar(me);
            const nm = document.getElementById('headerUserName');
            const rl = document.getElementById('headerUserRole');
            if (me && nm) nm.textContent = me.name || me.username || 'User';
            if (me && rl) rl.textContent = '';
        }

        function toPh10(v) {
            let d = String(v || '').replace(/\D/g, '');
            if (d.startsWith('63') && d.length >= 12) d = d.slice(2);
            else if (d.startsWith('0')) d = d.replace(/^0+/, '');
            return d.slice(0, 10);
        }
        function phoneFieldHtml(id, value, disabled, placeholder) {
            return `<div class="ph-wrap"><span class="ph-prefix">+63</span><input type="tel" id="${id}" maxlength="10" inputmode="numeric" placeholder="${placeholder || '9XXXXXXXXX'}" value="${esc(toPh10(value))}" oninput="this.value=this.value.replace(/\\D/g,'').replace(/^0+/,'').slice(0,10)" ${disabled ? 'disabled' : ''}></div>`;
        }
        function phoneFull(id) {
            const el = document.getElementById(id);
            const d = el ? el.value.replace(/\D/g, '') : '';
            return d ? '+63' + d : '';
        }
        function isValidPh10(id) {
            const el = document.getElementById(id);
            return !!el && /^\d{10}$/.test(el.value.replace(/\D/g, ''));
        }

        function ageFromDate(iso) {
            const b = new Date(iso + 'T00:00:00');
            if (isNaN(b.getTime())) return NaN;
            const t = new Date();
            let age = t.getFullYear() - b.getFullYear();
            if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
            return age;
        }
        function birthdateError(iso, who) {
            if (!iso) return 'Please complete all required fields.';
            const b = new Date(iso + 'T00:00:00');
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (isNaN(b.getTime()) || b.getFullYear() < 1900) return 'Please enter a valid birthdate.';
            if (b > today || b.getFullYear() > today.getFullYear()) return 'Please enter a valid birthdate — a future date or a year that has not happened yet is not allowed.';
            if (ageFromDate(iso) < 18) return `Please enter a valid birthdate — ${who || 'the person'} must be at least 18 years old.`;
            return '';
        }
        function maxAdultBirthdateISO() {
            const d = new Date(); d.setFullYear(d.getFullYear() - 18);
            return d.toISOString().split('T')[0];
        }

        const COMBO_LISTS = {
            eligibility: ['Eligible', 'Permanently Deferred', 'Under Review'],
            allergies: ['Drug Allergies', 'Food Allergies', 'Environmental Allergies', 'Insect Allergies', 'Latex Allergies', 'Animal Allergies', 'Chemical Allergies', 'Seasonal Allergies', 'Skin Allergies', 'Mold Allergies', 'None'],
            medical: ['HIV / AIDS', 'Hepatitis B', 'Hepatitis C', 'Heart Disease', 'Cancer History', 'Severe Asthma', 'Epilepsy / Seizure', 'Blood Clotting Disorder', 'Organ Transplant History',
                'High Blood Pressure', 'Low Hemoglobin', 'Recent Surgery', 'Fever / Infection', 'Tuberculosis History', 'COVID Positive', 'Recent Tattoo / Piercing', 'None'],
            screening: ['HIV Positive', 'Hepatitis B Positive', 'Hepatitis C Positive', 'Heart Disease History', 'Cancer History', 'Organ Transplant Recipient', 'Severe Blood Disorder', 'Epilepsy With Medication', 'Chronic Kidney Failure', 'Positive Syphilis Test',
                'Low Hemoglobin Level', 'High Blood Pressure', 'Fever Or Infection', 'Recent Tattoo Piercing', 'Under Medication Antibiotics', 'Recent Surgery Recovery', 'Lack Of Sleep', 'Alcohol Intake Last 24hrs', 'Menstruation Heavy Flow', 'Underweight Below 50kg',
                'Incomplete Laboratory Results', 'Abnormal Blood Pressure Reading', 'Pending Medical Clearance', 'Unclear Medical History', 'Needs Doctor Approval', 'Recent Travel History', 'Irregular Pulse Rate', 'Borderline Hemoglobin Level', 'Incomplete Donor Questionnaire', 'For Second Screening', 'None']
        };
        const COMBO_GROUPS = {
            medical: [
                ['Permanently Deferred', ['HIV / AIDS', 'Hepatitis B', 'Hepatitis C', 'Heart Disease', 'Cancer History', 'Severe Asthma', 'Epilepsy / Seizure', 'Blood Clotting Disorder', 'Organ Transplant History']],
                ['Under Review', ['High Blood Pressure', 'Low Hemoglobin', 'Recent Surgery', 'Fever / Infection', 'Tuberculosis History', 'COVID Positive', 'Recent Tattoo / Piercing']]
            ],
            screening: [
                ['Permanently Deferred', ['HIV Positive', 'Hepatitis B Positive', 'Hepatitis C Positive', 'Heart Disease History', 'Cancer History', 'Organ Transplant Recipient', 'Severe Blood Disorder', 'Epilepsy With Medication', 'Chronic Kidney Failure', 'Positive Syphilis Test']],
                ['Under Review', ['High Blood Pressure', 'Low Hemoglobin Level', 'Fever Or Infection', 'Recent Tattoo Piercing', 'Under Medication Antibiotics', 'Recent Surgery Recovery', 'Lack Of Sleep', 'Alcohol Intake Last 24hrs', 'Menstruation Heavy Flow', 'Underweight Below 50kg']],
                ['Under Review', ['Incomplete Laboratory Results', 'Abnormal Blood Pressure Reading', 'Pending Medical Clearance', 'Unclear Medical History', 'Needs Doctor Approval', 'Recent Travel History', 'Irregular Pulse Rate', 'Borderline Hemoglobin Level', 'Incomplete Donor Questionnaire', 'For Second Screening']]
            ]
        };
        ['medical', 'screening'].forEach(k => { COMBO_LISTS[k] = [].concat(...COMBO_GROUPS[k].map(g => g[1])).concat(['None']); });
        const ELIG_RANK = { 'Eligible': 0, 'Under Review': 1, 'Permanently Deferred': 3 };
        function eligibilityFor(kind, v) {
            if (!v || v === 'None') return 'Eligible';
            for (const [label, items] of COMBO_GROUPS[kind]) { if (items.includes(v)) return label; }
            return 'Under Review';
        }
        const COMBO_META = {
            eligibility: { label: 'Eligibility Status', required: true, icon: 'fa-circle-check' },
            allergies: { label: 'Known Allergies', placeholder: 'Known Allergies (if any)', icon: 'fa-triangle-exclamation' },
            medical: { label: 'Existing Medical Conditions', placeholder: 'Existing Medical Condition (if any)', icon: 'fa-notes-medical' },
            screening: { label: 'Deferral / Screening Notes', placeholder: 'Screening Notes Reasons (if any)', icon: 'fa-clipboard-check' }
        };
        function normalizeEligibility(v) { return (v === 'Deferred' || v === 'Temporary Deferred') ? 'Under Review' : (v || ''); }
        function comboHtml(id, kind, current, disabled, onChangeJs, usePlaceholder) {
            const list = COMBO_LISTS[kind];
            const meta = COMBO_META[kind];
            let cur = String(current == null ? '' : current).trim();
            if (kind === 'eligibility') cur = normalizeEligibility(cur);
            const showPlaceholder = !!usePlaceholder && !meta.required && cur === '';
            if (cur === '' && !meta.required && !showPlaceholder) cur = 'None';
            const isOther = cur !== '' && !list.includes(cur);
            const optHtml = o => `<option value="${esc(o)}" ${cur === o ? 'selected' : ''}>${esc(o)}</option>`;
            const opts = list.map(optHtml).join('');
            const ph = showPlaceholder ? `<option value="" selected>${esc(meta.placeholder)}</option>` : '';
            return `<div class="combo-wrap">
                <div class="combo-sel"><i class="fa-solid ${meta.icon}"></i>
                <select id="${id}" ${disabled ? 'disabled' : ''} onchange="onComboChange('${id}'); ${onChangeJs || ''}">
                    ${ph}${opts}
                    <option value="__other" ${isOther ? 'selected' : ''}>Others, please specify</option>
                </select></div>
                <input type="text" id="${id}_other" class="combo-other" placeholder="Please specify (${esc(meta.label)})" value="${isOther ? esc(cur) : ''}" ${disabled ? 'disabled' : ''} style="${isOther ? 'display:block;' : ''}">
            </div>`;
        }
        function onComboChange(id) {
            const sel = document.getElementById(id);
            const other = document.getElementById(id + '_other');
            if (!sel || !other) return;
            if (sel.value === '__other') { other.style.display = 'block'; other.focus(); }
            else { other.style.display = 'none'; other.value = ''; }
        }
        function getComboValue(id) {
            const sel = document.getElementById(id);
            if (!sel) return '';
            if (sel.value === '__other') {
                const o = document.getElementById(id + '_other');
                return o ? o.value.trim() : '';
            }
            return sel.value;
        }
        function setComboValue(id, value) {
            const sel = document.getElementById(id);
            if (!sel) return;
            const has = Array.from(sel.options).some(o => o.value === value);
            sel.value = has ? value : (value ? '__other' : sel.options[0].value);
            onComboChange(id);
            if (!has && value) { const o = document.getElementById(id + '_other'); if (o) o.value = value; }
        }
        function setComboDisabled(id, disabled) {
            const sel = document.getElementById(id);
            const other = document.getElementById(id + '_other');
            if (sel) sel.disabled = disabled;
            if (other) other.disabled = disabled;
        }
        function firstEmptyOther(ids) {
            for (const [id, label] of ids) {
                const sel = document.getElementById(id);
                if (sel && sel.value === '__other') {
                    const o = document.getElementById(id + '_other');
                    if (!o || !o.value.trim()) { if (o) o.focus(); return label; }
                }
            }
            return '';
        }
        function alertSpecifyOther(label) {
            showAlertBox(`Please specify your "Others" answer for ${label} — it cannot be left blank.`);
        }
        function onMedicalComboChange(medId, eligId) {
            const el = document.getElementById(eligId);
            if (!el || el.disabled) return;
            const screenId = medId.replace('medicalConditions', 'deferralReason');
            const a = eligibilityFor('medical', getComboValue(medId));
            const b = document.getElementById(screenId) ? eligibilityFor('screening', getComboValue(screenId)) : 'Eligible';
            setComboValue(eligId, ELIG_RANK[a] >= ELIG_RANK[b] ? a : b);
        }
        function eligibilityClass(v) {
            const slug = String(v || 'Eligible').trim().toLowerCase().replace(/\s+/g, '-');
            return ['eligible', 'temporary-deferred', 'permanently-deferred', 'under-review', 'deferred'].includes(slug) ? slug : 'other';
        }
        function initWizardCombos() {
            const put = (hostId, html) => { const h = document.getElementById(hostId); if (h) h.innerHTML = html; };
            put('w_eligibilityStatus_host', comboHtml('w_eligibilityStatus', 'eligibility', 'Eligible', false));
            put('w_allergies_host', comboHtml('w_allergies', 'allergies', '', false, '', true));
            put('w_medicalConditions_host', comboHtml('w_medicalConditions', 'medical', '', false, "onMedicalComboChange('w_medicalConditions','w_eligibilityStatus')", true));
            put('w_deferralReason_host', comboHtml('w_deferralReason', 'screening', '', false, "onMedicalComboChange('w_medicalConditions','w_eligibilityStatus')", true));
        }
        window.addEventListener('DOMContentLoaded', initWizardCombos);

        const REQUIRED_MSG = 'Please complete all required fields.';

        function esc(value) {
            return String(value === undefined || value === null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function showConfirmBox(message, onConfirm, title) {
            const isWarn = /^\s*(⚠️\s*)?(delete|clear)/i.test(title || '') || /^\s*⚠️/.test(message || '');
            const cardEl = document.getElementById('genericConfirmCard');
            const iconEl = document.getElementById('genericConfirmIcon');
            if (cardEl) { cardEl.classList.toggle('alert-box-card', isWarn); cardEl.classList.toggle('type-warning', isWarn); }
            if (iconEl) iconEl.style.display = isWarn ? 'flex' : 'none';
            title = String(title || '').replace(/^⚠️\s*/, '') || undefined;
            message = String(message || '').replace(/^⚠️\s*/, '');
            document.getElementById('genericConfirmTitle').innerText = title || 'Please Confirm';
            document.getElementById('genericConfirmMessage').innerText = message;
            const okBtn = document.getElementById('genericConfirmOkBtn');
            const freshBtn = okBtn.cloneNode(true);
            okBtn.parentNode.replaceChild(freshBtn, okBtn);
            const cancelBtn = document.querySelector('#genericConfirmModal .btn-cancel');
            const okOriginalHtml = 'Okay';
            freshBtn.disabled = false; freshBtn.style.opacity = ''; freshBtn.innerHTML = okOriginalHtml;
            if (cancelBtn) { cancelBtn.disabled = false; cancelBtn.style.opacity = ''; }
            freshBtn.addEventListener('click', () => {
                const result = onConfirm();
                if (result && result.__keepOpen) return;
                if (result && typeof result.then === 'function') {
                    freshBtn.disabled = true;
                    freshBtn.style.opacity = '0.6';
                    freshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Please wait...';
                    if (cancelBtn) cancelBtn.disabled = true;
                    result.finally(() => {
                        closeModal('genericConfirmModal');
                        freshBtn.disabled = false;
                        freshBtn.style.opacity = '';
                        freshBtn.innerHTML = okOriginalHtml;
                        if (cancelBtn) cancelBtn.disabled = false;
                    });
                } else {
                    closeModal('genericConfirmModal');
                }
            });
            openModal('genericConfirmModal');
        }

        const FP_EMAIL_FAIL_MSG = 'Unable to send the verification email right now. Please try again in a moment or check your internet Connection.';

        let sessionExpiredHandled = false;

        function wipeLocalAppData() {
            localStorage.removeItem('redflow_logged_in');
            localStorage.removeItem('redflow_current_user');
            ['redflow_donors_masterlist', 'redflow_monitoring_records', 'redflow_audit_log',
             'redflow_notifications', 'redflow_system_users', 'redflow_staff_profile'
            ].forEach(key => localStorage.removeItem(key));
            editRequests = [];
            donorsData = [];
            monitoringRecords = [];
            systemUsers = [];
        }

        function handleSessionExpired() {
            if (sessionExpiredHandled) return;
            sessionExpiredHandled = true;
            try { clearInterval(exportLockTimer); } catch (e) {}
            ['exportPasswordModal', 'genericConfirmModal'].forEach(id => {
                const m = document.getElementById(id);
                if (m) closeModal(id);
            });
            wipeLocalAppData();
            document.getElementById('mainAppContainer').style.display = 'none';
            document.getElementById('loginView').classList.remove('hidden');
            showAlertBox('Your session has expired. Please log in again.');
        }

        function apiRequest(url, method = 'GET', body = null, _isRetry = false) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (csrfMeta) headers['X-CSRF-TOKEN'] = csrfMeta.content;
            return fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            }).catch(() => {
                const netErr = new Error('No internet connection. Please check your connection and try again.');
                netErr.isNetworkError = true;
                throw netErr;
            }).then(res => {
                return res.json().catch(() => ({})).then(data => {
                    if (!res.ok) {
                        if (res.status === 419 && !_isRetry) {
                            return fetch('/csrf-token').then(r => r.json()).then(fresh => {
                                if (csrfMeta && fresh.csrf_token) csrfMeta.content = fresh.csrf_token;
                                return apiRequest(url, method, body, true);
                            });
                        }
                        if (res.status === 419) {
                            const err = new Error('Your session expired. Please refresh the page and log in again.');
                            err.status = 419;
                            throw err;
                        }
                        const publicUrl = url === '/login' || url === '/register' || url === '/logout' || url.startsWith('/forgot-password');
                        if (res.status === 401 && !publicUrl) {
                            handleSessionExpired();
                            const err = new Error('Your session has expired. Please log in again.');
                            err.status = 401;
                            err.sessionExpired = true;
                            throw err;
                        }
                        const err = new Error(data.message || ('Something went wrong (error ' + res.status + '). Please check your internet connection and try again.'));
                        err.status = res.status;
                        err.data = data;
                        throw err;
                    }
                    return data;
                });
            });
        }

        function hydrateAppDataFromServer() {
            loadBloodBags();
            apiRequest('/api/donors').then(data => {
                donorsData = data.donors || [];
                localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                renderDonorCards();
                updateStatisticsData();
            }).catch(() => {  });

            apiRequest('/api/donation-records').then(data => {
                monitoringRecords = data.records || [];
                localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));
                renderMonitoringTable();
                renderDonorCards();
                updateStatisticsData();
            }).catch(() => {});

            apiRequest('/api/edit-requests').then(data => {
                editRequests = (data && data.requests) || [];
                syncPendingDonorCards();
                updateRequestsBadge();
                renderRequestsView();
                renderMonitoringTable();
            }).catch(() => {});

            apiRequest('/api/users').then(data => {
                systemUsers = data.users || [];
                localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
                const me = safeParseJSON('redflow_current_user');
                const fresh = me && systemUsers.find(u => u.id === me.id);
                if (fresh) { localStorage.setItem('redflow_current_user', JSON.stringify(fresh)); refreshHeaderAvatar(); }
                renderAdminApprovalPageView();
                renderUsersLogView();
            }).catch(() => {});

            apiRequest('/api/notifications').then(data => {
                if (data && data.notifications) {
                    const store = loadNotificationsStore();
                    Object.assign(store, data.notifications);
                    saveNotificationsStore(store);
                    updateNotificationBadge();
                    renderNotificationsView();
                }
            }).catch(() => {});

            apiRequest('/api/audit-log').then(data => {
                if (data && data.entries) {
                    localStorage.setItem('redflow_audit_log', JSON.stringify(data.entries));
                    renderAuditLogView();
                }
            }).catch(() => {});
        }

        function safeParseJSON(key, fallback = null) {
            const raw = localStorage.getItem(key);
            if (raw === null || raw === undefined || raw === 'undefined') return fallback;
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.warn(`Corrupted localStorage value for "${key}" was reset.`, e);
                localStorage.removeItem(key);
                return fallback;
            }
        }

        let systemUsers = safeParseJSON('redflow_system_users') || [];

        let donorsData = safeParseJSON('redflow_donors_masterlist') || [];

        let monitoringRecords = safeParseJSON('redflow_monitoring_records') || [];

        let staffData = safeParseJSON('redflow_staff_profile') || {
            name: "",
            role: "Staff",
            sex: "",
            bday: "",
            address: "",
            email: "",
            contact: "",
            avatar: "picture.jpg"
        };

        function syncStaffDataFromUser(user) {
            return {
                name: user.name || '',
                username: user.username || '',
                role: user.role || 'Staff',
                sex: user.gender || '',
                bday: user.dob || '',
                address: user.brgy || '',
                email: user.email || '',
                contact: user.contact || '',
                avatar: getUserAvatar(user)
            };
        }

        let isViewingStaff = true;
        let activeSelectedDonorId = null;

        window.addEventListener('DOMContentLoaded', () => {
            const isLoggedIn = localStorage.getItem('redflow_logged_in');
            const currentUser = safeParseJSON('redflow_current_user');
            if (isLoggedIn === 'true' && currentUser) {
                document.getElementById('loginView').classList.add('hidden');
                document.getElementById('mainAppContainer').style.display = 'block';
 setupSidebarByRole(currentUser);
                refreshHeaderAvatar();
                isSidebarOpen = window.innerWidth > 768;
                applySidebarState();
                setTimeout(() => { 
                    renderDonorCards();
                    renderMonitoringTable();
                    renderAdminApprovalPageView();
                    renderUsersLogView();
                    updateNotificationBadge();
                    hydrateAppDataFromServer();
                }, 100);
            }
            setupOtpBoxBehavior('.fp-otp');
            setupOtpBoxBehavior('.cp-otp');
        });

        function setupOtpBoxBehavior(selector) {
            const boxes = Array.from(document.querySelectorAll(selector));
            if (boxes.length === 0) return;
            boxes.forEach((box, i) => {
                box.addEventListener('input', () => {
                    const digits = box.value.replace(/\D/g, '');
                    if (digits.length > 1) {
                        distributeOtpDigits(boxes, i, digits);
                        return;
                    }
                    box.value = digits;
                    if (digits && i < boxes.length - 1) boxes[i + 1].focus();
                });
                box.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !box.value && i > 0) {
                        boxes[i - 1].focus();
                    }
                });
                box.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pasted = (e.clipboardData || window.clipboardData).getData('text');
                    const digits = pasted.replace(/\D/g, '');
                    if (!digits) return;
                    distributeOtpDigits(boxes, 0, digits);
                });
            });
        }

        function distributeOtpDigits(boxes, startIndex, digits) {
            let d = 0;
            for (let i = startIndex; i < boxes.length && d < digits.length; i++, d++) {
                boxes[i].value = digits[d];
            }
            const nextEmpty = boxes.findIndex(b => !b.value);
            (nextEmpty === -1 ? boxes[boxes.length - 1] : boxes[nextEmpty]).focus();
        }

        function setupSidebarByRole(user) {
            const sidebarMenuContainer = document.getElementById('sidebarMenuContainer');
            if (!sidebarMenuContainer) return;

            const item = (icon, label, onclick, page, badge) =>
                `<button class="side-custom-btn" data-page="${page}" ${badge ? 'data-bs="' + badge + '"' : ''} onclick="${onclick}"><span class="side-ico"><i class="fa-solid ${icon}"></i></span><span class="side-label">${label}</span></button>`;

            const sec = t => `<div class="side-section">${t}</div>`;
            if (user && user.role === 'Admin') {
                sidebarMenuContainer.innerHTML = [
                    sec('MAIN'),
                    item('fa-chart-pie', 'Statistics Dashboard', "switchMainPage('statistics', this); updateStatisticsData();", 'statistics'),
                    item('fa-list-check', 'Donor Masterlist', "switchMainPage('home', this)", 'home'),
                    item('fa-user-check', 'Donor Screening', "switchMainPage('donorscreening', this); loadEditRequests(); renderDonorScreening();", 'donorscreening', 'ds'),
                    item('fa-user-shield', 'User Verification', "switchMainPage('approvals', this); renderAdminApprovalPageView();", 'approvals', 'ver'),
                    item('fa-boxes-stacked', 'Blood Inventory', "switchMainPage('bloodinventory', this); loadBloodBags();", 'bloodinventory'),
                    item('fa-snowflake', 'Blood Storage', "switchMainPage('bloodstorage', this); loadBloodBags();", 'bloodstorage'),
                    item('fa-triangle-exclamation', 'Expiration Alert', "switchMainPage('expiryalert', this); loadBloodBags();", 'expiryalert', 'exp'),
                    sec('OPERATIONS'),
                    item('fa-truck-medical', 'Blood Transfer', "switchMainPage('bloodtransfer', this); loadBloodBags(); loadBloodTransfers();", 'bloodtransfer'),
                    item('fa-hand-holding-medical', 'Patient Blood Release', "switchMainPage('patientrelease', this); loadBloodBags(); loadBloodTransfers();", 'patientrelease'),
                    item('fa-code-pull-request', 'Request Management', "switchMainPage('requests', this); loadEditRequests(); renderRequestsView();", 'requests', 'req'),
                    sec('SYSTEM'),
                    item('fa-users-rectangle', 'Users Log', "switchMainPage('userslog', this); renderUsersLogView();", 'userslog'),
                    item('fa-shield-halved', 'Audit Log', "switchMainPage('auditlog', this); renderAuditLogView(); refreshAuditLogFromServer();", 'auditlog'),
                    `<button class="side-custom-btn" onclick="openExportPasswordModal()"><span class="side-ico"><i class="fa-solid fa-file-export"></i></span><span class="side-label">Export Masterlist</span></button>`,
                    item('fa-lock', 'Account Security', "switchMainPage('settings', this); resetChangePasswordFlow();", 'settings')
                ].join('');
            } else {
                sidebarMenuContainer.innerHTML = [
                    item('fa-list-check', 'Donor Masterlist', "switchMainPage('home', this)", 'home'),
                    item('fa-hourglass-half', 'Pending Status', "switchMainPage('myrequests', this); loadEditRequests();", 'myrequests', 'mypend'),
                    item('fa-paper-plane', 'Request Submitted', "switchMainPage('requestsubmitted', this); loadEditRequests();", 'requestsubmitted', 'mysub'),
                    item('fa-scale-balanced', 'Policies', "switchMainPage('about', this); loadPolicyTab('privacy')", 'about'),
                    item('fa-lock', 'Account Security', "switchMainPage('settings', this); resetChangePasswordFlow();", 'settings')
                ].join('');
            }
            const homeSide = sidebarMenuContainer.querySelector('[data-page="home"]');
            if (homeSide) homeSide.classList.add('active');
            loadPolicyTab('privacy');
            const myReqTitle = document.getElementById('myRequestsTitle');
            if (myReqTitle) myReqTitle.textContent = 'PENDING STATUS';
            const bottomItems = document.querySelectorAll('.bottom-nav-item');
            if (bottomItems[2]) bottomItems[2].style.display = '';
            applyDarkModeIcon();
            updateRequestsBadge();
        }
        function updateStatisticsData() {
            const totalPendingElem = document.getElementById('statTotalPending');
            const numberAdminElem = document.getElementById('statNumberAdmin');
            const numberStaffElem = document.getElementById('statNumberStaff');
            const numberDonorsElem = document.getElementById('statNumberDonors');
            if (totalPendingElem) {
                const pendingCount = systemUsers.filter(u => u.role === 'Staff' && u.status === 'Pending').length;
                totalPendingElem.innerText = pendingCount;
            }
            const pendingDonorElem = document.getElementById('statPendingDonor');
            if (pendingDonorElem) pendingDonorElem.innerText = screeningCounts('All').review;
            const pendingMedTechElem = document.getElementById('statPendingMedTech');
            if (pendingMedTechElem) pendingMedTechElem.innerText = systemUsers.filter(u => u.role === 'Blood Bank MedTech' && u.status === 'Pending').length;
            if (numberAdminElem) numberAdminElem.innerText = systemUsers.filter(u => u.role === 'Admin').length;
            if (numberStaffElem) numberStaffElem.innerText = systemUsers.filter(u => u.role === 'Staff' && u.status === 'Approved').length;
            const numberMedTechElem = document.getElementById('statNumberMedTech');
            if (numberMedTechElem) numberMedTechElem.innerText = systemUsers.filter(u => u.role === 'Blood Bank MedTech' && u.status === 'Approved').length;
            if (numberDonorsElem) numberDonorsElem.innerText = donorsData.length;
            const numberHistoryElem = document.getElementById('statNumberHistory');
            if (numberHistoryElem) numberHistoryElem.innerText = monitoringRecords.length;

            const numberNotificationsElem = document.getElementById('statNumberNotifications');
            if (numberNotificationsElem) {
                numberNotificationsElem.innerText = getCurrentUserNotifications().length || 0;
            }
            const numberAuditLogElem = document.getElementById('statNumberAuditLog');
            if (numberAuditLogElem) {
                const auditLog = safeParseJSON('redflow_audit_log') || [];
                numberAuditLogElem.innerText = auditLog.length;
            }
            const numberUserLogElem = document.getElementById('statNumberUserLog');
            if (numberUserLogElem) numberUserLogElem.innerText = systemUsers.length;
            const monthlyDateInput = document.getElementById('monthlyDonationsDate');
            const todayStr = new Date().toISOString().split('T')[0];
            if (monthlyDateInput && !monthlyDateInput.value) monthlyDateInput.value = todayStr;
            if (monthlyDateInput) renderMonthlyDonationsChart(monthlyDateInput.value.split('-')[0]);
            renderBloodTypeAvailability();
            updateDonationCounts();
            renderWeeklyDonation();
            renderScreeningStats();
            renderCollectedBags();
            renderBloodDistribution();
            updateSidebarBadges();
        }
        function renderMonthlyDonationsChart(year) {
            const chartElem = document.getElementById('monthlyDonationsChart');
            const labelsElem = document.getElementById('monthlyDonationsLabels');
            if (!chartElem || !labelsElem) return;
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const counts = new Array(12).fill(0);
            allDonationDates().forEach(d => {
                if (d.startsWith(String(year))) {
                    const monthIdx = parseInt(d.split('-')[1], 10) - 1;
                    if (monthIdx >= 0 && monthIdx < 12) counts[monthIdx]++;
                }
            });
            const maxCount = Math.max(...counts, 1);
            chartElem.innerHTML = counts.map(c => {
                const pct = c > 0 ? (c / maxCount * 100) : 0;
                return `
                <div class="monthly-chart-col">
                    <div class="monthly-chart-track">
                        <div class="monthly-chart-count" style="bottom:calc(${pct}% + 4px);">${c}</div>
                        <div class="monthly-chart-bar" style="height:${pct}%;"></div>
                    </div>
                </div>`;
            }).join('');
            labelsElem.innerHTML = monthNames.map(m => `<span>${m}</span>`).join('');
            renderMonthlyTotal(year);
        }
        function dateYear(id) {
            const el = document.getElementById(id);
            if (el && !el.value) el.value = isoLocal(new Date());
            return el && el.value ? el.value.slice(0, 4) : String(new Date().getFullYear());
        }
        function donorHistoryYears(d) {
            const nm = String(d.name || '').trim().toLowerCase();
            const years = new Set();
            monitoringRecords.forEach(rec => {
                const mine = (rec.donorId && String(rec.donorId) === String(d.id)) || (!rec.donorId && nm && String(rec.name || '').trim().toLowerCase() === nm);
                if (!mine) return;
                if (Array.isArray(rec.transactions)) rec.transactions.forEach(tx => { if (tx && tx.date) years.add(String(tx.date).slice(0, 4)); });
                if (rec.donationDate && rec.donationDate !== 'N/A') years.add(String(rec.donationDate).slice(0, 4));
            });
            return years;
        }
        function donorsOfYear(year) {
            if (year === 'All') return donorsData;
            return donorsData.filter(d => donorHistoryYears(d).has(String(year)));
        }
        function renderBloodTypeAvailability() {
            const listElem = document.getElementById('bloodTypeAvailabilityList');
            if (!listElem) return;
            const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
            const countByType = {};
            bloodTypes.forEach(bt => countByType[bt] = 0);
            const list = donorsData;
            list.forEach(donor => {
                if (countByType.hasOwnProperty(donor.bloodType)) {
                    countByType[donor.bloodType]++;
                }
            });
            const maxCount = Math.max(...Object.values(countByType), 1);
            listElem.innerHTML = bloodTypes.map(bt => `
                <div class="blood-avail-row">
                    <div class="blood-avail-row-top">
                        <span>${bt}</span>
                        <span>${countByType[bt]}</span>
                    </div>
                    <div class="blood-avail-track">
                        <div class="blood-avail-fill" style="width:${(countByType[bt] / maxCount * 100)}%;"></div>
                    </div>
                </div>
            `).join('');
        }
        const BLOOD_COLORS = { 'A+': '#c8102e', 'A-': '#f06a7d', 'B+': '#1e5fd6', 'B-': '#6ea0f0', 'AB+': '#7b3fb5', 'AB-': '#b68be0', 'O+': '#0f9d58', 'O-': '#7fd1a4', 'Unknown': '#9aa3b2' };
        function renderBloodDistribution() {
            const box = document.getElementById('bloodDistribution');
            if (!box) return;
            const distYear = dateYear('distDate');
            const list = donorsOfYear(distYear).filter(d => normElig(d.eligibilityStatus) === 'Eligible');
            const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
            const counts = {};
            types.forEach(t => counts[t] = 0);
            list.forEach(d => { const k = types.includes(d.bloodType) ? d.bloodType : 'Unknown'; counts[k]++; });
            const total = list.length;
            const R = 70, C = 2 * Math.PI * R;
            let offset = 0;
            const arcs = total === 0 ? `<circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--border-color)" stroke-width="28"/>` :
                types.filter(t => counts[t] > 0).map(t => {
                    const len = counts[t] / total * C;
                    const seg = `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${BLOOD_COLORS[t]}" stroke-width="28" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 100 100)"/>`;
                    offset += len;
                    return seg;
                }).join('');
            const legend = types.filter(t => t !== 'Unknown' || counts.Unknown > 0).map(t => {
                const pct = total ? (counts[t] / total * 100).toFixed(1) : '0.0';
                return `<div class="dist-row"><span class="dist-dot" style="background:${BLOOD_COLORS[t]};"></span><span class="dist-type">${t}</span><span class="dist-count">${counts[t]}</span><span class="dist-pct">${pct}%</span></div>`;
            }).join('');
            box.innerHTML = `<div class="dist-wrap">
                <svg viewBox="0 0 200 200" class="dist-donut">${arcs}
                    <text x="100" y="96" text-anchor="middle" font-size="12" fill="var(--text-muted)">Total</text>
                    <text x="100" y="120" text-anchor="middle" font-size="28" font-weight="700" fill="var(--text-dark)">${total}</text>
                </svg>
                <div class="dist-legend"><div class="dist-row dist-head"><span class="dist-dot" style="background:transparent;"></span><span class="dist-type">Blood Type</span><span class="dist-count">Total</span><span class="dist-pct">%</span></div>${legend}</div>
            </div>`;
        }

        let bloodBags = [];
        let bagInvTab = 'In Stock';
        const BAG_COMPONENT_DAYS = { 'Whole Blood': 35, 'Red Cells': 42, 'Platelets': 5, 'Plasma': 365 };
        const BAG_COMPONENT_KIND = { 'Whole Blood': 'fridge', 'Red Cells': 'fridge', 'Platelets': 'agitator', 'Plasma': 'freezer' };
        const STORAGE_KIND_DEFAULT_TEMP = { fridge: '2-6 C', freezer: '-18 C or colder', agitator: '20-24 C' };
        let storageUnits = [];
        const BAG_DEFAULT_CENTER = 'Irosin District Hospital';
        const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        function bagLocationsFor(component) {
            return storageUnits.filter(u => u.kind === BAG_COMPONENT_KIND[component]);
        }
        function unitLabel(v) {
            const t = String(v == null ? '' : v).trim();
            return (!t || /^1\s*unit(\/bag)?$/i.test(t)) ? '1 Bag' : t;
        }
        function isoLocal(d) {
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
        function fmtMDY(iso) {
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
            return m ? m[2] + '-' + m[3] + '-' + m[1] : (iso || 'N/A');
        }
        function fmtLongDate(iso) {
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
            return m ? m[2] + '-' + m[3] + '-' + m[1] : 'N/A';
        }
        function normElig(v) {
            const n = normalizeEligibility(v || 'Eligible');
            if (n === 'Eligible' || n === 'Permanently Deferred') return n;
            return 'Under Review';
        }

        function allDonationDates() {
            const out = [];
            monitoringRecords.forEach(rec => {
                const set = new Set();
                if (Array.isArray(rec.transactions)) {
                    rec.transactions.forEach(tx => { if (tx && tx.date) set.add(String(tx.date).slice(0, 10)); });
                }
                if (rec.donationDate && rec.donationDate !== 'N/A') set.add(String(rec.donationDate).slice(0, 10));
                set.forEach(d => out.push(d));
            });
            return out;
        }

        function renderMonthlyTotal(year) {
            const el = document.getElementById('monthlyTotalPerYear');
            if (!el) return;
            const total = allDonationDates().filter(d => d.startsWith(String(year))).length;
            el.textContent = `Total Per Year: ${total} (${year})`;
        }

        function weekRangeOf(date) {
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dow = (d.getDay() + 6) % 7;
            const start = new Date(d); start.setDate(d.getDate() - dow);
            const end = new Date(start); end.setDate(start.getDate() + 6);
            return [isoLocal(start), isoLocal(end)];
        }

        function updateDonationCounts() {
            const dates = allDonationDates();
            const now = new Date();
            const today = isoLocal(now);
            const [ws, we] = weekRangeOf(now);
            const month = today.slice(0, 7);
            const year = today.slice(0, 4);
            const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            set('cntToday', dates.filter(d => d === today).length);
            set('cntWeek', dates.filter(d => d >= ws && d <= we).length);
            set('cntMonth', dates.filter(d => d.startsWith(month)).length);
            set('cntYear', dates.filter(d => d.startsWith(year)).length);
        }

        function renderWeeklyDonation() {
            const input = document.getElementById('weeklyDonationDate');
            const grid = document.getElementById('weeklyCalendarGrid');
            const list = document.getElementById('weeklyStatsList');
            const totalEl = document.getElementById('weeklyStatsTotal');
            if (!input || !grid || !list || !totalEl) return;
            if (!input.value) input.value = isoLocal(new Date());
            const [y, m] = input.value.split('-').map(n => parseInt(n, 10));
            const monthKey = input.value.slice(0, 7);
            const dates = allDonationDates().filter(d => d.startsWith(monthKey));
            const perDay = {};
            dates.forEach(d => { perDay[d] = (perDay[d] || 0) + 1; });
            const daysInMonth = new Date(y, m, 0).getDate();
            const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
            const todayIso = isoLocal(new Date());
            const weeks = [0, 0, 0, 0, 0];
            let cells = '';
            for (let i = 0; i < lead; i++) cells += '<div class="wk-day empty"></div>';
            for (let day = 1; day <= daysInMonth; day++) {
                const iso = monthKey + '-' + String(day).padStart(2, '0');
                const n = perDay[iso] || 0;
                const weekIdx = Math.min(4, Math.floor((lead + day - 1) / 7));
                weeks[weekIdx] += n;
                cells += `<div class="wk-day ${n ? 'has' : ''} ${iso === todayIso ? 'today' : ''}">${day}${n ? `<span class="wk-badge">${n}</span>` : ''}</div>`;
            }
            grid.innerHTML = '<div class="wk-cal-head">' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<span>${x}</span>`).join('') + '</div><div class="wk-cal-grid">' + cells + '</div>';
            const maxW = Math.max(...weeks, 1);
            list.innerHTML = weeks.map((n, i) => `
                <div class="wk-week-row">
                    <div class="wk-week-top"><span>Week ${i + 1} Total:</span><strong>${n} donation${n === 1 ? '' : 's'}</strong></div>
                    <div class="wk-track"><div class="wk-fill" style="width:${n / maxW * 100}%;"></div></div>
                </div>`).join('');
            const total = weeks.reduce((a, b) => a + b, 0);
            totalEl.innerHTML = `Total (Week 1-5): <span style="color:var(--primary-red);">${total} donation${total === 1 ? '' : 's'}</span>`;
        }

        function screeningCounts(year) {
            const list = donorsOfYear(year);
            const pendingNew = editRequests.filter(r => r.type === 'donor_create' && r.status === 'Pending' && (year === 'All' || !r.createdAt || String(r.createdAt).startsWith(String(year)))).length;
            const c = { total: list.length + pendingNew, eligible: 0, review: pendingNew, perm: 0 };
            list.forEach(d => {
                const e = normElig(d.eligibilityStatus);
                if (e === 'Eligible') c.eligible++;
                else if (e === 'Permanently Deferred') c.perm++;
                else c.review++;
            });
            return c;
        }

        function renderScreeningStats() {
            const box = document.getElementById('screeningStatsList');
            if (!box) return;
            const year = dateYear('screeningDate');
            const c = screeningCounts(year);
            box.innerHTML = `
                <div class="scr-row"><span>Total Donors</span><b>${c.total}</b></div>
                <div class="scr-row"><span>Eligible</span><b>${c.eligible}</b></div>
                <div class="scr-row"><span>Under Review</span><b>${c.review}</b></div>
                <div class="scr-row"><span>Permanently Deferred</span><b>${c.perm}</b></div>
                <div class="scr-result">
                    <div class="pass"><b>${c.eligible}</b>Passed Screening</div>
                    <div class="fail"><b>${c.perm}</b>Failed Screening</div>
                </div>`;
            const all = screeningCounts('All');
            const q = document.getElementById('statQualified'); if (q) q.textContent = all.eligible;
            const p = document.getElementById('statPermDeferred'); if (p) p.textContent = all.perm;
        }

        function bagBuckets(year) {
            const b = { usable: 0, rejected: 0, stock: 0, expired: 0, expiring: 0, used: 0, disposed: 0, transferred: 0, released: 0, total: 0 };
            bloodBags.filter(x => !year || String(x.collectedOn || '').startsWith(String(year))).forEach(x => {
                b.total++;
                if (x.status === 'Rejected') { b.rejected++; return; }
                b.usable++;
                if (x.status === 'Used') b.used++;
                else if (x.status === 'Transferred') b.transferred++;
                else if (x.status === 'Released') b.released++;
                else if (x.status === 'Disposed') b.disposed++;
                else if (x.level === 3) b.expired++;
                else { b.stock++; if (x.level >= 1) b.expiring++; }
            });
            return b;
        }

        function renderCollectedBags() {
            const box = document.getElementById('collectedBagsList');
            const year = dateYear('bagsDate');
            const b = bagBuckets(year);
            if (box) {
                box.innerHTML = `
                    <div class="scr-row"><span>Collected - Usable</span><b>${b.usable}</b></div>
                    <div class="scr-row"><span>Collected - Rejected</span><b>${b.rejected}</b></div>
                    <div class="scr-row"><span>In Stock</span><b>${b.stock}</b></div>
                    <div class="scr-row"><span>Expired (still in storage)</span><b>${b.expired}</b></div>
                    <div class="scr-row"><span>Disposed</span><b>${b.disposed}</b></div>
                    <div class="scr-row"><span>Used</span><b>${b.used}</b></div>
                    <div class="scr-row"><span>Transferred (to another place)</span><b>${b.transferred}</b></div>
                    <div class="scr-row"><span>Released (to patient)</span><b>${b.released}</b></div>`;
            }
            const r = document.getElementById('statRejectedTop'); if (r) r.textContent = bagBuckets().rejected;
        }

        function exportStatisticsExcel() {
            const dates = allDonationDates();
            const now = new Date();
            const today = isoLocal(now);
            const [ws, we] = weekRangeOf(now);
            const year = String(now.getFullYear());
            const sc = screeningCounts('All');
            const b = bagBuckets();
            const rows = [];
            const add = (section, item, value) => rows.push([section, item, String(value)]);
            const statTitle = ['Donation Statistics ' + year];
            add('Donations', 'Today', dates.filter(d => d === today).length + ' donors');
            add('Donations', 'This Week', dates.filter(d => d >= ws && d <= we).length + ' donors');
            add('Donations', 'This Month', dates.filter(d => d.startsWith(today.slice(0, 7))).length + ' donors');
            add('Donations', 'This Year (' + year + ')', dates.filter(d => d.startsWith(year)).length + ' donors');
            const monthly = new Array(12).fill(0);
            dates.filter(d => d.startsWith(year)).forEach(d => { monthly[parseInt(d.slice(5, 7), 10) - 1]++; });
            monthly.forEach((n, i) => add('Monthly Donations ' + year, MONTH_NAMES_FULL[i], n));
            const weeks = [0, 0, 0, 0, 0];
            const lead = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
            dates.filter(d => d.startsWith(today.slice(0, 7))).forEach(d => { weeks[Math.min(4, Math.floor((lead + parseInt(d.slice(8, 10), 10) - 1) / 7))]++; });
            weeks.forEach((n, i) => add('Weekly Donations ' + MONTH_NAMES_FULL[now.getMonth()] + ' ' + year, 'Week ' + (i + 1), n));
            add('Donor Screening', 'Total Donors', sc.total);
            add('Donor Screening', 'Eligible', sc.eligible);
            add('Donor Screening', 'Under Review (Pending Donors)', sc.review);
            add('Donor Screening', 'Permanently Deferred', sc.perm);
            add('Collected Bags', 'Collected - Usable', b.usable);
            add('Collected Bags', 'Collected - Rejected', b.rejected);
            add('Collected Bags', 'In Stock', b.stock);
            add('Collected Bags', 'Expired (still in storage)', b.expired);
            add('Collected Bags', 'Disposed', b.disposed);
            add('Collected Bags', 'Used', b.used);
            add('Collected Bags', 'Transferred (to another place)', b.transferred);
            add('Collected Bags', 'Released (to patient)', b.released);
            ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].forEach(t => add('Donors per Blood Type', t, donorsData.filter(d => d.bloodType === t).length));
            add('Donor Masterlist Eligible Donor', 'Overall', sc.eligible);
            const blob = buildDonorXlsx(['Section', 'Item', 'Value'], rows, new Set([2]), new Set(), 'Statistics', statTitle);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'REDFLOW-Statistics-' + today + '.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1500);
            showAlertBox('Statistics exported successfully.');
        }

        function loadBloodBags() {
            if (!isInventoryUser()) return Promise.resolve();
            return Promise.all([apiRequest('/admin/storage-units'), apiRequest('/admin/blood-bags')]).then(([u, b]) => {
                storageUnits = (u && u.units) || [];
                bloodBags = (b && b.bags) || [];
                refreshBloodViews();
                showExpiryPopupOnce();
                refreshNotificationsFromServer();
            }).catch(() => {});
        }
        function refreshBloodViews() {
            renderBloodInventory();
            renderBloodStorage();
            renderExpiryAlert();
            renderCollectedBags();
            updateBloodAlertBadge();
        }
        function setSideBadge(key, n) {
            document.querySelectorAll('[data-bs="' + key + '"] .side-label').forEach(l => {
                const old = l.querySelector('.side-badge');
                if (old) old.remove();
                if (n > 0) l.insertAdjacentHTML('beforeend', `<span class="side-badge">${n > 99 ? '99+' : n}</span>`);
            });
        }
        function updateSidebarBadges() {
            const me = safeParseJSON('redflow_current_user') || {};
            const pendingOf = t => editRequests.filter(r => r.type === t && r.status === 'Pending');
            if (typeof bloodBags !== 'undefined') setSideBadge('exp', bloodBags.filter(x => x.status === 'In Stock' && x.level >= 2).length);
            setSideBadge('ds', pendingOf('donor_create').length);
            setSideBadge('req', pendingOf('donor_edit').length);
            setSideBadge('ver', (typeof systemUsers !== 'undefined' ? systemUsers : []).filter(u => u.role !== 'Admin' && u.status === 'Pending').length);
            const mine = t => pendingOf(t).filter(r => !r.requestedByUsername || r.requestedByUsername === me.username).length;
            setSideBadge('mypend', mine('donor_create'));
            setSideBadge('mysub', mine('donor_edit'));
        }
        function updateBloodAlertBadge() { updateSidebarBadges(); }
        function showExpiryPopupOnce() {
            if (!isInventoryUser()) return;
            const expired = bloodBags.filter(x => x.status === 'In Stock' && x.level === 3).length;
            const soon = bloodBags.filter(x => x.status === 'In Stock' && x.level === 2).length;
            if (expired + soon === 0) return;
            const key = 'redflow_expiry_popup_' + isoLocal(new Date()) + '_' + expired + '_' + soon;
            try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) {}
            const parts = [];
            if (expired) parts.push(`${expired} blood bag${expired === 1 ? ' is' : 's are'} EXPIRED`);
            if (soon) parts.push(`${soon} bag${soon === 1 ? ' is' : 's are'} expiring very soon`);
            showAlertBox('Blood Expiration Alert: ' + parts.join(' and ') + '. Please check the Expiration Alert page and dispose expired blood.');
        }

        function bagTag(b) {
            if (b.status === 'Transferred') return '<span class="bs-tag" style="background:#0f8b8d;">Transferred</span>';
            if (b.status === 'Released') return '<span class="bs-tag" style="background:#7b3fa0;">Released</span>';
            if (b.status === 'Used') return '<span class="bs-tag gray">Used</span>';
            if (b.status === 'Disposed') return '<span class="bs-tag gray">Disposed</span>';
            if (b.status === 'Rejected') return '<span class="bs-tag expired">Rejected</span>';
            if (b.level === 3) return '<span class="bs-tag expired">Expired - Dispose</span>';
            if (b.level === 2) return '<span class="bs-tag near">Expiring very soon</span>';
            if (b.level === 1) return '<span class="bs-tag near" style="background:#e0b400;">Watch</span>';
            return '<span class="bs-tag">Safe</span>';
        }
        function bagLeftText(b) {
            if (b.status !== 'In Stock') return '';
            if (b.daysLeft < 0) return `Expired ${-b.daysLeft} day${b.daysLeft === -1 ? '' : 's'} ago`;
            return b.daysLeft === 0 ? 'Expires today' : `${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'} left`;
        }
        function bagRowHtml(b, showStorage, inventoryMode) {
            const inv = !!inventoryMode && isInventoryUser();
            const btns = [];
            if (isInventoryUser() && b.status === 'In Stock') {
                if (b.level < 3) btns.push(`<button class="req-btn ok" onclick="closeBloodBag(${b.id}, 'used')">Mark Used</button>`);
                btns.push(`<button class="req-btn no" onclick="closeBloodBag(${b.id}, 'disposed')">Dispose</button>`);
            }
            const actions = btns.length ? `<div class="bs-bag-actions">${btns.join('')}</div>` : '';
            const check = inv ? `<input type="checkbox" class="admin-row-checkbox bag-check" ${selectedBagIds.has(b.id) ? 'checked' : ''} onchange="toggleBagSelect(${b.id}, this.checked)">` : '';
            return `<div class="bs-bag">${check}
                <div style="flex:1; min-width:200px;">
                    <div class="bs-bag-main">${esc(b.donorName || 'Unknown donor')} (${esc(b.bloodType || '?')}) &middot; ${esc(b.component)} ${bagTag(b)}</div>
                    <div class="bs-bag-sub"><strong>${esc(b.bagId || '')}</strong>${b.bloodCenter ? ' &middot; ' + esc(b.bloodCenter) : ''} &middot; 1 Bag &middot; Collected ${esc(fmtLongDate(b.collectedOn))}${b.status === 'Rejected' ? '' : ' &middot; Expires ' + esc(fmtLongDate(b.expiresOn))} ${bagLeftText(b) ? '&middot; ' + esc(bagLeftText(b)) : ''}${showStorage && b.storageLocation ? ' &middot; ' + esc(b.storageLocation) + (b.shelf ? ', ' + esc(b.shelf) : '') : ''}</div>
                </div>${actions}</div>`;
        }

        function inventoryTabOf(b) {
            if (b.status === 'Transferred') return 'Transferred';
            if (b.status === 'Released') return 'Released';
            if (b.status === 'Used') return 'Used';
            if (b.status === 'Disposed') return 'Disposed';
            if (b.status === 'Rejected') return 'Rejected';
            return b.level === 3 ? 'Expired' : 'In Stock';
        }
        function renderBloodInventory() {
            const sum = document.getElementById('bagInvSummary');
            const tabs = document.getElementById('bagInvTabs');
            const list = document.getElementById('bagInvList');
            if (!sum || !tabs || !list) return;
            const b = bagBuckets();
            const card = (label, v, color) => `<div class="stat-summary-card" style="border-left-color:${color};"><div class="stat-summary-label">${label}</div><div class="stat-summary-value">${v}</div></div>`;
            sum.innerHTML = card('Bags In Stock', b.stock, 'var(--success-green)') + card('Expiring Soon', b.expiring, 'var(--warning-orange)') +
                card('Expired', b.expired, 'var(--primary-red)') + card('Used', b.used, 'var(--primary-blue)') + card('Transferred', b.transferred, '#0f8b8d') + card('Released', b.released, '#7b3fa0') +
                card('Rejected', b.rejected, 'var(--warning-orange)') + card('Disposed', b.disposed, '#6b7280');
            const comp = (document.getElementById('bagInvComponent') || {}).value || 'All';
            const pool = bloodBags.filter(x => comp === 'All' || x.component === comp);
            const names = ['In Stock', 'Expired', 'Used', 'Transferred', 'Released', 'Rejected', 'Disposed'];
            tabs.innerHTML = names.map(n => `<button class="req-tab ${bagInvTab === n ? 'active' : ''}" onclick="bagInvTab='${n}'; renderBloodInventory();">${n}<span class="bs-count">${pool.filter(x => inventoryTabOf(x) === n).length}</span></button>`).join('');
            const shown = pool.filter(x => inventoryTabOf(x) === bagInvTab);
            inventoryShownIds = shown.map(x => x.id);
            const existing = new Set(bloodBags.map(x => x.id));
            Array.from(selectedBagIds).forEach(id => { if (!existing.has(id)) selectedBagIds.delete(id); });
            list.innerHTML = shown.length ? shown.map(x => bagRowHtml(x, true, true)).join('') : '<div class="bs-empty">No bags in this list.</div>';
            const tools = document.getElementById('bagInvDeleteTools');
            if (tools) tools.style.display = isInventoryUser() ? 'flex' : 'none';
            refreshBagDeleteBtn();
        }
        let selectedBagIds = new Set();
        let inventoryShownIds = [];
        function refreshBagDeleteBtn() {
            const btn = document.getElementById('bagInvDeleteBtn');
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selectedBagIds.size})`;
                btn.classList.toggle('active', selectedBagIds.size > 0);
            }
            const all = document.getElementById('bagInvSelectAll');
            if (all) all.checked = inventoryShownIds.length > 0 && inventoryShownIds.every(id => selectedBagIds.has(id));
        }
        function toggleBagSelect(id, checked) {
            if (checked) selectedBagIds.add(id); else selectedBagIds.delete(id);
            refreshBagDeleteBtn();
        }
        function toggleSelectAllBags(checked) {
            inventoryShownIds.forEach(id => { if (checked) selectedBagIds.add(id); else selectedBagIds.delete(id); });
            document.querySelectorAll('#bagInvList .bag-check').forEach(cb => { cb.checked = checked; });
            refreshBagDeleteBtn();
        }
        function deleteSelectedBags() {
            deleteBloodBags(Array.from(selectedBagIds));
        }
        function deleteBloodBags(ids) {
            if (!ids || !ids.length || !isInventoryUser()) return;
            showConfirmBox(`⚠️ Delete ${ids.length} blood bag record${ids.length === 1 ? '' : 's'}? This will be permanently removed and cannot be undone.`, () => {
                return apiRequest('/admin/blood-bags', 'DELETE', { ids: ids }).then(() => {
                    ids.forEach(id => selectedBagIds.delete(id));
                    return loadBloodBags();
                }).then(() => {
                    showAlertBox('Blood bag record' + (ids.length === 1 ? ' was' : 's were') + ' deleted successfully.');
                }).catch(err => showAlertBox(err.message || 'Error: Could not delete the selected bag records.'));
            }, 'Delete Bag Records');
        }

        function bagMatches(x, q) {
            if (!q) return true;
            return [x.donorName, x.bloodType, x.component, x.bagId].join(' ').toLowerCase().includes(q);
        }
        function searchValue(id) {
            const el = document.getElementById(id);
            return el ? String(el.value || '').trim().toLowerCase() : '';
        }
        function isProtectedStorageUnit(u) {
            return /^(refrigerator\s*[12]|freezer\s*1|platelet\s*agitator\s*1)$/i.test(String(u.name || '').trim());
        }
        function renderBloodStorage() {
            const box = document.getElementById('bloodStorageUnits');
            if (!box) return;
            const groupHtml = (title, icon, bags, controls) => {
                const shelves = {};
                bags.forEach(x => { const k = x.shelf || 'Not specified'; (shelves[k] = shelves[k] || []).push(x); });
                const body = bags.length ? Object.keys(shelves).sort().map(k => `<div class="bs-unit-head" style="font-size:12.5px; background:transparent;">${esc(k)}<span>${shelves[k].length} bag${shelves[k].length === 1 ? '' : 's'}</span></div>` + shelves[k].map(x => bagRowHtml(x, false)).join('')).join('') : '<div class="bs-empty">Empty</div>';
                return `<div class="bs-unit"><div class="bs-unit-head"><span style="color:var(--text-dark); font-size:14.5px;"><i class="fa-solid ${icon}" style="color:var(--primary-red);"></i> ${esc(title)}</span><span style="display:flex; gap:6px; align-items:center;">${controls || ''}<span class="bs-pill">${bags.length} bag${bags.length === 1 ? '' : 's'}</span></span></div>${body}</div>`;
            };
            const bsQuery = searchValue('bsSearch');
            const inStock = bloodBags.filter(x => x.status === 'In Stock' && bagMatches(x, bsQuery));
            let html = storageUnits.map(u => groupHtml(u.label, 'fa-snowflake', inStock.filter(x => x.storageUnitId === u.id),
                `<button class="req-btn view" onclick="openStorageUnitModal(${u.id})"><i class="fa-solid fa-pen"></i> Edit</button>${isProtectedStorageUnit(u) ? '' : `<button class="req-btn no" onclick="deleteStorageUnit(${u.id})"><i class="fa-solid fa-trash"></i> Delete</button>`}`)).join('');
            const custom = Array.from(new Set(inStock.filter(x => !x.storageUnitId && x.storageLocation).map(x => x.storageLocation)));
            html += custom.map(loc => groupHtml(loc + ' (Others)', 'fa-location-dot', inStock.filter(x => !x.storageUnitId && x.storageLocation === loc), '')).join('');
            box.innerHTML = html || '<div class="bs-empty">No storage unit yet. Add one to start recording bags.</div>';
        }
        function elOrDummy(id) {
            return document.getElementById(id) || { style: {}, dataset: {}, value: '', textContent: '' };
        }
        function onStorageKindChange() {
            const k = document.getElementById('su_kind').value;
            const t = document.getElementById('su_temp');
            if (!document.getElementById('su_id').value) t.value = STORAGE_KIND_DEFAULT_TEMP[k] || '';
        }
        const SU_PRESET_BASE = { fridge: 'Refrigerator', agitator: 'Platelet Agitator', freezer: 'Freezer' };
        function nextStorageName(kind) {
            const base = SU_PRESET_BASE[kind];
            const re = new RegExp('^' + base + '(?:\\s+(\\d+))?$', 'i');
            const used = new Set();
            storageUnits.forEach(u => {
                const m = re.exec(String(u.name || '').trim());
                if (m) used.add(m[1] ? parseInt(m[1], 10) : 1);
            });
            let n = 1;
            while (used.has(n)) n++;
            return base + ' ' + n;
        }
        function onStoragePresetChange() {
            const v = elOrDummy('su_preset').value;
            const custom = v === 'others';
            elOrDummy('su_name_wrap').style.display = custom ? '' : 'none';
            elOrDummy('su_kind_wrap').style.display = custom ? '' : 'none';
            elOrDummy('su_temp_wrap').style.display = custom ? '' : 'none';
            const hint = elOrDummy('su_auto_hint');
            if (custom) {
                hint.textContent = '';
                onStorageKindChange();
            } else {
                document.getElementById('su_kind').value = v;
                document.getElementById('su_temp').value = STORAGE_KIND_DEFAULT_TEMP[v];
                hint.textContent = 'Will be saved as: ' + nextStorageName(v);
            }
        }
        function openStorageUnitModal(id) {
            const u = id ? storageUnits.find(x => x.id === id) : null;
            document.getElementById('storageUnitTitle').textContent = u ? 'Edit Storage Unit' : 'Add Storage Unit';
            document.getElementById('su_id').value = u ? u.id : '';
            document.getElementById('su_name').value = u ? u.name : '';
            document.getElementById('su_kind').value = u ? u.kind : 'fridge';
            document.getElementById('su_temp').value = u ? u.temperature : STORAGE_KIND_DEFAULT_TEMP.fridge;
            elOrDummy('su_preset_wrap').style.display = u ? 'none' : '';
            elOrDummy('su_name_label').textContent = u ? 'NAME' : 'SPECIFY NAME';
            if (u) {
                elOrDummy('su_name_wrap').style.display = '';
                elOrDummy('su_kind_wrap').style.display = 'none';
                elOrDummy('su_temp_wrap').style.display = '';
            } else {
                elOrDummy('su_preset').value = 'fridge';
                onStoragePresetChange();
            }
            openModal('storageUnitModal');
        }
        let isSavingUnit = false;
        function saveStorageUnit() {
            if (isSavingUnit) return;
            const id = document.getElementById('su_id').value;
            const preset = elOrDummy('su_preset').value;
            let body;
            if (!id && preset && preset !== 'others') {
                body = { preset: preset };
            } else {
                const name = document.getElementById('su_name').value.trim();
                const temp = document.getElementById('su_temp').value.trim();
                if (!name || !temp) { showAlertBox(REQUIRED_MSG); return; }
                body = { name: name, temperature: temp, kind: document.getElementById('su_kind').value };
            }
            isSavingUnit = true;
            apiRequest(id ? '/admin/storage-units/' + id : '/admin/storage-units', id ? 'PATCH' : 'POST', body).then(data => {
                closeModal('storageUnitModal');
                const savedName = data && data.unit ? data.unit.name : '';
                showAlertBox(id ? 'Storage unit updated successfully!' : 'Storage unit added successfully!' + (savedName ? ' (' + savedName + ')' : ''));
                return loadBloodBags();
            }).catch(err => showAlertBox(err.message || 'Error: Could not save this storage unit.')).finally(() => { isSavingUnit = false; });
        }
        function deleteStorageUnit(id) {
            const u = storageUnits.find(x => x.id === id);
            if (!u || !isInventoryUser() || isProtectedStorageUnit(u)) return;
            if (u.inStock > 0 || bloodBags.some(x => x.status === 'In Stock' && x.storageUnitId === id)) {
                showAlertBox('Cannot delete ' + u.name + ': it still has blood bags inside. Move or dispose them first.');
                return;
            }
            showTripleConfirm('Delete Storage Unit', [
                `⚠️ Delete ${u.label}? This will be recorded in the Audit Log.`,
                `⚠️ Please confirm once more. ${u.name} will be permanently removed. Do you still want to continue?`
            ], () => apiRequest('/admin/storage-units/' + id, 'DELETE').then(() => {
                showAlertBox('Storage unit deleted successfully.');
                return loadBloodBags();
            }).catch(err => showAlertBox(err.message || 'Error: Could not delete this storage unit.')));
        }

        function renderExpiryAlert() {
            const box = document.getElementById('expiryAlertSections');
            const btn = document.getElementById('disposeExpiredBtn');
            if (!box) return;
            const eaQuery = searchValue('eaSearch');
            const stock = bloodBags.filter(x => x.status === 'In Stock' && bagMatches(x, eaQuery));
            const groups = [
                ['Expired - Dispose Now', 'fa-skull-crossbones', 'bs-card-red', stock.filter(x => x.level === 3)],
                ['Expiring Very Soon', 'fa-triangle-exclamation', 'bs-card-orange', stock.filter(x => x.level === 2)],
                ['Watch List', 'fa-clock', 'bs-card-yellow', stock.filter(x => x.level === 1)],
                ['Safe (not near expiry)', 'fa-circle-check', 'bs-card-green', stock.filter(x => x.level === 0)]
            ];
            box.innerHTML = groups.map(([title, icon, cls, list]) => `
                <div class="bs-unit ${cls}">
                    <div class="bs-unit-head"><span style="color:var(--text-dark); font-size:14.5px;"><i class="fa-solid ${icon}"></i> ${title} <span class="bs-count">${list.length}</span></span></div>
                    ${list.length ? list.sort((a, b) => a.daysLeft - b.daysLeft).map(x => bagRowHtml(x, true)).join('') : '<div class="bs-empty">Nothing here.</div>'}
                </div>`).join('');
            const expired = groups[0][3].length;
            if (btn) {
                btn.style.display = (isInventoryUser() && expired > 0) ? 'inline-block' : 'none';
                btn.innerHTML = `<i class="fa-solid fa-trash"></i> Dispose All Expired (${expired})`;
            }
        }

        let bloodTransfers = [];
        let transferBagPool = [];
        let transferSelected = new Set();
        let isSavingTransfer = false;
        let selectedTransferIds = new Set();
        let transferShownIds = { hospital: [], patient: [] };
        function refreshTransferDeleteBtns() {
            [['hospital', 'bt'], ['patient', 'pr']].forEach(([kind, pre]) => {
                const ids = transferShownIds[kind] || [];
                const selected = ids.filter(id => selectedTransferIds.has(id)).length;
                const btn = document.getElementById(pre + 'DeleteBtn');
                if (btn) {
                    btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selected})`;
                    btn.classList.toggle('active', selected > 0);
                }
                const all = document.getElementById(pre + 'SelectAll');
                if (all) all.checked = ids.length > 0 && selected === ids.length;
            });
        }
        function toggleTransferSelect(id, checked) {
            if (checked) selectedTransferIds.add(id); else selectedTransferIds.delete(id);
            refreshTransferDeleteBtns();
        }
        function toggleSelectAllTransfers(kind, checked) {
            (transferShownIds[kind] || []).forEach(id => { if (checked) selectedTransferIds.add(id); else selectedTransferIds.delete(id); });
            document.querySelectorAll('.tr-check').forEach(cb => { if (cb.dataset.kind === kind) cb.checked = checked; });
            refreshTransferDeleteBtns();
        }
        function deleteSelectedTransfers(kind) {
            const ids = (transferShownIds[kind] || []).filter(id => selectedTransferIds.has(id));
            if (!ids.length || !isInventoryUser()) return;
            showConfirmBox(`⚠️ Delete ${ids.length} record${ids.length === 1 ? '' : 's'}? The blood bag${ids.length === 1 ? '' : 's'} will return to In Stock. This cannot be undone.`, () => {
                return apiRequest('/admin/blood-transfers', 'DELETE', { ids: ids }).then(() => {
                    ids.forEach(id => selectedTransferIds.delete(id));
                    return Promise.all([loadBloodBags(), loadBloodTransfers()]);
                }).then(() => {
                    showAlertBox('Selected record' + (ids.length === 1 ? ' was' : 's were') + ' deleted successfully.');
                }).catch(err => showAlertBox(err.message || 'Error: Could not delete the selected records.'));
            }, 'Delete Records');
        }
        function loadBloodTransfers() {
            if (!isInventoryUser()) return Promise.resolve();
            return apiRequest('/admin/blood-transfers').then(data => {
                bloodTransfers = (data && data.transfers) || [];
                renderTransfers();
            }).catch(() => {});
        }
        function transferCardHtml(t) {
            const isPatient = t.kind === 'patient';
            const head = isPatient
                ? `${esc(t.patientName || 'Patient')} &middot; ${esc(t.bloodType || '?')} ${esc(t.component || '')}`
                : `${esc(t.destination || 'Unknown place')} &middot; ${esc(t.bloodType || '?')} ${esc(t.component || '')}`;
            const subParts = [`<strong>${esc(t.bagId || '')}</strong>`, '1 Bag', esc(fmtLongDate(t.transferredOn))];
            if (isPatient && t.destination) subParts.push('Hospital / Ward: ' + esc(t.destination));
            if (t.reason) subParts.push('Reason: ' + esc(t.reason));
            if (t.remarks) subParts.push('Remarks: ' + esc(t.remarks));
            if (t.recordedBy) subParts.push('Recorded by ' + esc(t.recordedBy));
            const check = `<input type="checkbox" class="admin-row-checkbox tr-check" data-kind="${esc(t.kind)}" ${selectedTransferIds.has(t.id) ? 'checked' : ''} onchange="toggleTransferSelect(${t.id}, this.checked)">`;
            return `<div class="bs-bag">${check}<div style="flex:1; min-width:200px;"><div class="bs-bag-main">${head} <span class="bs-tag" style="background:${isPatient ? '#7b3fa0' : '#0f8b8d'};">${isPatient ? 'Released' : 'Transferred'}</span> <button type="button" class="req-btn view" style="margin-left:6px; padding:3px 10px; font-size:12px;" onclick="openTransferEdit(${t.id})"><i class="fa-solid fa-pen"></i> Edit</button></div><div class="bs-bag-sub">${subParts.join(' &middot; ')}</div></div></div>`;
        }
        function renderTransfers() {
            [['hospital', 'btList', 'btSearch'], ['patient', 'prList', 'prSearch']].forEach(([kind, listId, searchId]) => {
                const box = document.getElementById(listId);
                if (!box) return;
                const q = searchValue(searchId);
                const items = bloodTransfers.filter(t => t.kind === kind).filter(t => !q || [t.destination, t.patientName, t.bloodType, t.bagId, t.reason, t.component].join(' ').toLowerCase().includes(q));
                transferShownIds[kind] = items.map(t => t.id);
                box.innerHTML = items.length ? items.map(transferCardHtml).join('') : '<div class="bs-empty">No records yet.</div>';
            });
            refreshTransferDeleteBtns();
        }
        function openTransferModal(kind) {
            const stock = bloodBags.filter(x => x.status === 'In Stock' && x.level < 3);
            if (!stock.length) { showAlertBox('There are no In Stock blood bags available to ' + (kind === 'patient' ? 'release.' : 'transfer.')); return; }
            transferBagPool = stock;
            transferSelected = new Set();
            const isPatient = kind === 'patient';
            document.getElementById('tr_edit_id').value = '';
            document.getElementById('tr_bags_wrap').style.display = '';
            document.getElementById('tr_kind').value = kind;
            document.getElementById('trTitle').textContent = isPatient ? 'Patient Blood Release' : 'Blood Transfer';
            document.getElementById('tr_patient_wrap').style.display = isPatient ? '' : 'none';
            document.getElementById('tr_reason_wrap').style.display = isPatient ? '' : 'none';
            document.getElementById('tr_destination_label').textContent = isPatient ? 'HOSPITAL / WARD (OPTIONAL)' : 'HOSPITAL / PLACE TRANSFERRED TO';
            document.getElementById('tr_destination').placeholder = isPatient ? 'e.g. Irosin District Hospital - Emergency Room' : 'e.g. Sorsogon Provincial Hospital';
            ['tr_patient', 'tr_destination', 'tr_reason', 'tr_remarks', 'trBagSearch'].forEach(id => { document.getElementById(id).value = ''; });
            const dateEl = document.getElementById('tr_date');
            dateEl.value = isoLocal(new Date());
            dateEl.max = isoLocal(new Date());
            renderTransferBagList();
            openModal('transferModal');
        }
        function openTransferEdit(id) {
            const t = bloodTransfers.find(x => x.id === id);
            if (!t) return;
            const isPatient = t.kind === 'patient';
            document.getElementById('tr_edit_id').value = String(t.id);
            document.getElementById('tr_kind').value = t.kind;
            document.getElementById('tr_bags_wrap').style.display = 'none';
            document.getElementById('trTitle').textContent = isPatient ? 'Edit Patient Blood Release' : 'Edit Blood Transfer';
            document.getElementById('tr_patient_wrap').style.display = isPatient ? '' : 'none';
            document.getElementById('tr_reason_wrap').style.display = isPatient ? '' : 'none';
            document.getElementById('tr_destination_label').textContent = isPatient ? 'HOSPITAL / WARD (OPTIONAL)' : 'HOSPITAL / PLACE TRANSFERRED TO';
            document.getElementById('tr_patient').value = t.patientName || '';
            document.getElementById('tr_destination').value = t.destination || '';
            document.getElementById('tr_reason').value = t.reason || '';
            document.getElementById('tr_remarks').value = t.remarks || '';
            const dateEl = document.getElementById('tr_date');
            dateEl.value = t.transferredOn || isoLocal(new Date());
            dateEl.max = isoLocal(new Date());
            openModal('transferModal');
        }
        function renderTransferBagList() {
            const q = searchValue('trBagSearch');
            const list = transferBagPool.filter(x => bagMatches(x, q));
            const box = document.getElementById('trBagList');
            box.innerHTML = list.length ? list.map(x => `<label class="tr-bag-row"><input type="checkbox" ${transferSelected.has(x.id) ? 'checked' : ''} onchange="toggleTransferBag(${x.id}, this.checked)"><span><strong>${esc(x.bloodType || '?')}</strong> &middot; ${esc(x.component)} &middot; ${esc(x.bagId || '')} &middot; ${esc(x.donorName || 'Unknown donor')} &middot; Expires ${esc(fmtLongDate(x.expiresOn))}</span></label>`).join('') : '<div class="bs-empty">No bag found.</div>';
            document.getElementById('trBagCount').textContent = transferSelected.size + ' selected';
        }
        function toggleTransferBag(id, checked) {
            if (checked) transferSelected.add(id); else transferSelected.delete(id);
            document.getElementById('trBagCount').textContent = transferSelected.size + ' selected';
        }
        function saveTransfer() {
            if (isSavingTransfer) return;
            const kind = document.getElementById('tr_kind').value;
            const body = {
                kind: kind,
                bagIds: Array.from(transferSelected),
                destination: document.getElementById('tr_destination').value.trim(),
                patientName: document.getElementById('tr_patient').value.trim(),
                reason: document.getElementById('tr_reason').value.trim(),
                remarks: document.getElementById('tr_remarks').value.trim(),
                transferredOn: document.getElementById('tr_date').value
            };
            const editId = document.getElementById('tr_edit_id').value;
            if (!editId && !body.bagIds.length) { showAlertBox('Please select at least one blood bag.'); return; }
            if (kind === 'hospital' && !body.destination) { showAlertBox('Please enter the hospital or place where the blood is transferred.'); return; }
            if (kind === 'patient' && (!body.patientName || !body.reason)) { showAlertBox('Please enter the patient name and the reason (e.g. accident).'); return; }
            if (!body.transferredOn) { showAlertBox('Please select the date.'); return; }
            isSavingTransfer = true;
            apiRequest(editId ? '/admin/blood-transfers/' + editId : '/admin/blood-transfers', editId ? 'PATCH' : 'POST', body).then(() => {
                closeModal('transferModal');
                showAlertBox(editId ? 'The record was updated successfully!' : (kind === 'patient' ? 'Blood release to the patient was recorded successfully!' : 'Blood transfer was recorded successfully!'));
                if (editId && typeof refreshAuditLogFromServer === 'function') refreshAuditLogFromServer();
                return Promise.all([loadBloodBags(), loadBloodTransfers()]);
            }).catch(err => showAlertBox(err.message || 'Error: Could not save this record.')).finally(() => { isSavingTransfer = false; });
        }
        let bagEligibleDonors = [];
        function filterBagDonors() {
            const q = ((elOrDummy('bag_donor_search') || { value: '' }).value || '').trim().toLowerCase();
            const sel = document.getElementById('bag_donor');
            if (!sel) return;
            const keep = sel.value;
            const list = bagEligibleDonors.filter(d => !q || String(d.name || '').toLowerCase().includes(q));
            sel.innerHTML = list.length ? list.map(d => `<option value="${esc(d.id)}">${esc(d.name)} (${esc(d.bloodType)})</option>`).join('') : '<option value="">No donor found</option>';
            if (list.some(d => String(d.id) === keep)) sel.value = keep;
        }
        function openBloodBagModal() {
            const eligible = donorsData.filter(d => normElig(d.eligibilityStatus) === 'Eligible' && d.bloodType && d.bloodType !== 'Unknown');
            if (eligible.length === 0) {
                showAlertBox('Cannot record a bag: there is no Eligible donor with a known blood type yet.');
                return;
            }
            bagEligibleDonors = eligible;
            const bs = elOrDummy('bag_donor_search'); if (bs) bs.value = '';
            const bcode = document.getElementById('bag_code'); if (bcode) bcode.dataset.touched = '';
            filterBagDonors();
            document.getElementById('bag_component').value = 'Whole Blood';
            document.getElementById('bag_result').value = 'Usable';
            const dt = document.getElementById('bag_date');
            dt.max = isoLocal(new Date());
            dt.value = isoLocal(new Date());
            document.getElementById('bag_shelf').value = 'Shelf 1';
            elOrDummy('bag_shelf_other').value = '';
            document.getElementById('bag_center').value = BAG_DEFAULT_CENTER;
            document.getElementById('bag_location_other').value = '';
            elOrDummy('bag_expiry').dataset.touched = '';
            onBagComponentChange(true);
            openModal('bloodBagModal');
        }
        function bagExpiryEdited() {
            const v = elOrDummy('bag_expiry').value;
            elOrDummy('bag_expiry_hint').textContent = v ? `Expiration date set to ${fmtLongDate(v)}. You can still change it if it is not correct.` : '';
        }
        function onBagComponentChange(recalc) {
            const comp = document.getElementById('bag_component').value;
            const result = document.getElementById('bag_result').value;
            const locSel = document.getElementById('bag_location');
            const keep = locSel.value;
            const opts = bagLocationsFor(comp);
            locSel.innerHTML = opts.map(o => `<option value="${esc(o.id)}">${esc(o.label)}</option>`).join('') + '<option value="others">Please Specify</option>';
            if (Array.from(locSel.options).some(o => o.value === keep)) locSel.value = keep;
            const usable = result === 'Usable';
            document.getElementById('bag_location_other').style.display = (usable && locSel.value === 'others') ? '' : 'none';
            document.getElementById('bag_location_wrap').style.display = usable ? '' : 'none';
            document.getElementById('bag_shelf_wrap').style.display = usable ? '' : 'none';
            elOrDummy('bag_shelf_other').style.display = (usable && document.getElementById('bag_shelf').value === 'others') ? '' : 'none';
            if (recalc !== true) return;
            const dv = document.getElementById('bag_date').value;
            const hint = elOrDummy('bag_expiry_hint');
            if (dv) {
                const p = dv.split('-').map(n => parseInt(n, 10));
                const exp = new Date(p[0], p[1] - 1, p[2] + BAG_COMPONENT_DAYS[comp]);
                elOrDummy('bag_expiry').value = isoLocal(exp);
                hint.textContent = `${comp} expires on ${fmtLongDate(isoLocal(exp))} (${BAG_COMPONENT_DAYS[comp]} day${BAG_COMPONENT_DAYS[comp] === 1 ? '' : 's'} shelf life). You can edit the expiration date if needed.`;
                const sameDay = bloodBags.filter(x => x.collectedOn === dv).length + 1;
                const codeEl = document.getElementById('bag_code');
                if (codeEl.dataset.touched !== '1') codeEl.value = 'BAG-' + dv.replace(/-/g, '') + '-' + String(sameDay).padStart(3, '0');
            } else { hint.textContent = ''; elOrDummy('bag_expiry').value = ''; if (document.getElementById('bag_code').dataset.touched !== '1') document.getElementById('bag_code').value = ''; }
        }
        let isSavingBag = false;
        function saveBloodBag() {
            if (isSavingBag) return;
            const donorId = document.getElementById('bag_donor').value;
            const date = document.getElementById('bag_date').value;
            if (!donorId || !date) { showAlertBox('Please select a donor and the date collected.'); return; }
            const result = document.getElementById('bag_result').value;
            const center = document.getElementById('bag_center').value.trim();
            if (!center) { showAlertBox('Please enter the Blood Center.'); return; }
            const loc = document.getElementById('bag_location').value;
            const other = document.getElementById('bag_location_other').value.trim();
            const shelfSel = document.getElementById('bag_shelf').value;
            const shelfVal = shelfSel === 'others' ? elOrDummy('bag_shelf_other').value.trim() : shelfSel;
            const bagCodeVal = document.getElementById('bag_code').value.trim();
            const expiryVal = elOrDummy('bag_expiry').value;
            if (!expiryVal) { showAlertBox('Please enter the Expiration Date.'); return; }
            if (expiryVal < date) { showAlertBox('The Expiration Date cannot be earlier than the Date Collected.'); return; }
            if (!bagCodeVal) { showAlertBox('Please enter the Bag ID.'); return; }
            if (result === 'Usable' && !loc) { showAlertBox('Please choose a storage location. Add one first in Blood Storage if none is available.'); return; }
            if (result === 'Usable' && loc === 'others' && !other) { showAlertBox('Please specify the storage location.'); return; }
            if (result === 'Usable' && !shelfVal) { showAlertBox('Please specify the shelf / slot.'); return; }
            const btn = document.getElementById('saveBagBtn');
            isSavingBag = true;
            if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
            apiRequest('/admin/blood-bags', 'POST', {
                donorId: parseInt(donorId, 10),
                component: document.getElementById('bag_component').value,
                collectedOn: date,
                result: result,
                bloodCenter: center,
                storageUnitId: result === 'Usable' ? loc : null,
                storageOther: result === 'Usable' && loc === 'others' ? other : null,
                shelf: result === 'Usable' ? shelfVal : null,
                bagCode: bagCodeVal,
                expiresOn: expiryVal
            }).then(data => {
                if (data && data.bag) bloodBags.unshift(data.bag);
                refreshBloodViews();
                closeModal('bloodBagModal');
                showAlertBox('Collected bag recorded successfully! (1 Bag)');
            }).catch(err => {
                showAlertBox(err.message || 'Error: Could not record this bag. Please try again.');
            }).finally(() => {
                isSavingBag = false;
                if (btn) { btn.disabled = false; btn.style.opacity = ''; }
            });
        }
        function closeBloodBag(id, as) {
            const b = bloodBags.find(x => x.id === id);
            if (!b || !isInventoryUser()) return;
            const verb = as === 'used' ? 'mark as Used' : 'dispose';
            showTripleConfirm(as === 'used' ? 'Mark as Used' : 'Dispose Bag', [
                `Are you sure you want to ${verb} this ${b.component} bag (${b.bloodType}) from ${b.donorName}?`,
                `Please confirm once more: ${b.bagId || 'this bag'} will be ${as === 'used' ? 'marked as Used' : 'recorded as Disposed'}. This cannot be undone.`
            ], () => {
                apiRequest('/admin/blood-bags/' + id + '/' + as, 'PATCH').then(data => {
                    const i = bloodBags.findIndex(x => x.id === id);
                    if (i !== -1 && data && data.bag) bloodBags[i] = data.bag;
                    refreshBloodViews();
                    showAlertBox(as === 'used' ? 'The bag was marked as Used successfully.' : 'The bag was disposed successfully.');
                }).catch(err => showAlertBox(err.message || 'Error: Could not update this bag.'));
            });
        }
        function disposeAllExpiredBags() {
            const n = bloodBags.filter(x => x.status === 'In Stock' && x.level === 3).length;
            if (!n || !isInventoryUser()) return;
            showTripleConfirm('Dispose All Expired', [`⚠️ Dispose ALL ${n} expired bag${n === 1 ? '' : 's'}? They will be recorded as Disposed.`, `⚠️ Please confirm once more. All ${n} expired bag${n === 1 ? '' : 's'} will be disposed.`], () => {
                return apiRequest('/admin/blood-bags/dispose-expired', 'POST').then(() => {
                    showAlertBox(`${n} expired bag${n === 1 ? ' was' : 's were'} disposed successfully.`);
                    return loadBloodBags();
                }).catch(err => showAlertBox(err.message || 'Error: Could not dispose the expired bags.'));
            });
        }
        function daysLeftForExcel(b) {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(b.expiresOn || ''));
            if (!m) return '';
            const exp = new Date(+m[1], +m[2] - 1, +m[3]);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diff = Math.round((exp - today) / 86400000);
            if (diff < 0) return 'Expired ' + (-diff) + ' day' + (diff === -1 ? '' : 's') + ' ago';
            return String(diff);
        }
        function exportBloodInventoryExcel() {
            if (bloodBags.length === 0) { showAlertBox('There are no collected bags to export yet.'); return; }
            const rows = bloodBags.map(b => [b.bagId || '', b.bloodCenter || '', b.donorName || '', b.bloodType || '', b.component, '1 Bag', b.collectedOn || '', b.expiresOn || '', inventoryTabOf(b), b.storageLocation || 'N/A', b.shelf || 'N/A', b.status === 'In Stock' ? daysLeftForExcel(b) : '']);
            const blob = buildDonorXlsx(['Bag ID', 'Blood Center', 'Donor', 'Blood Type', 'Component', 'Unit', 'Date Collected', 'Expiry Date', 'Status', 'Storage Location', 'Shelf', 'Days Left'], rows, new Set([0, 3, 5, 6, 7, 8]), new Set(), 'Blood Inventory');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'REDFLOW-Blood-Inventory-' + isoLocal(new Date()) + '.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1500);
        }

        function renderAdminApprovalPageView() {
            const container = document.getElementById('adminApprovalPageViewList');
            if (!container) return;

            const pendingStaff = systemUsers.filter(u => u.role !== 'Admin' && u.status === 'Pending');
            const allStaff = systemUsers.filter(u => u.role !== 'Admin');
            const approvedCount = allStaff.filter(u => u.status === 'Approved').length;
            const summary = `<div class="approval-count-bar">
                    <div><span class="approval-count-num">${allStaff.length}</span><span class="approval-count-lbl">Registered Staff</span></div>
                    <div><span class="approval-count-num" style="color:var(--warning-orange);">${pendingStaff.length}</span><span class="approval-count-lbl">Pending</span></div>
                    <div><span class="approval-count-num" style="color:var(--success-green);">${approvedCount}</span><span class="approval-count-lbl">Approved</span></div>
                </div>`;
            if (pendingStaff.length === 0) {
                container.innerHTML = summary + '<div style="text-align:center; padding:20px; color:var(--text-muted);">No pending staff approvals at this time.</div>';
                return;
            }

            container.innerHTML = summary + `
                <table class="approval-table">
                    <thead>
                        <tr>
                            <th>User Role</th>
                            <th>Name</th>
                            <th>Contact / Location</th>
                            <th>ID Front</th>
                            <th>ID Back</th>
                            <th>Face Document</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingStaff.map(staff => {
                            const idFront = staff.idFront || PICTURE_FALLBACK;
                            const idBack = staff.idBack || PICTURE_FALLBACK;
                            const faceDoc = staff.faceDoc || PICTURE_FALLBACK;
                            return `
                            <tr>
                                <td><span class="approval-role-badge">${esc(staff.role)}</span></td>
                                <td style="font-weight:bold;">${esc(staff.name)}</td>
                                <td>
                                    <div>${esc(staff.email)}</div>
                                    ${staff.username ? `<div style="font-size:12px;">@${esc(staff.username)}</div>` : ''}
                                    <div style="color:var(--text-muted); font-size:12px;">${esc(staff.contact || '')}${staff.brgy ? ' | Brgy. ' + esc(staff.brgy) : ''}</div>
                                </td>
                                <td><img class="approval-doc-thumb" src="${esc(idFront)}" onerror="this.src=PICTURE_FALLBACK" onclick="openImageZoom('${esc(idFront)}')"></td>
                                <td><img class="approval-doc-thumb" src="${esc(idBack)}" onerror="this.src=PICTURE_FALLBACK" onclick="openImageZoom('${esc(idBack)}')"></td>
                                <td><img class="approval-doc-thumb" src="${esc(faceDoc)}" onerror="this.src=PICTURE_FALLBACK" onclick="openImageZoom('${esc(faceDoc)}')"></td>
                                <td>
                                    <button onclick="approveStaff('${esc(staff.id)}')" style="background:var(--success-green); color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:bold; cursor:pointer; margin-right:6px; font-size:12px; white-space:nowrap;"><i class="fa-solid fa-check"></i> Approve</button>
                                    <button onclick="rejectStaff('${esc(staff.id)}')" style="background:var(--primary-red); color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; white-space:nowrap;"><i class="fa-solid fa-xmark"></i> Reject</button>
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            `;
        }

        function openImageZoom(src) {
            document.getElementById('imageZoomTarget').src = src;
            document.getElementById('imageZoomOverlay').style.display = 'flex';
        }

        function closeImageZoom() {
            document.getElementById('imageZoomOverlay').style.display = 'none';
        }

        function isAdminUser() {
            const currentUser = safeParseJSON('redflow_current_user');
            return !!(currentUser && currentUser.role === 'Admin');
        }
        function isMedTechUser() {
            const currentUser = safeParseJSON('redflow_current_user');
            return !!(currentUser && currentUser.role === 'Blood Bank MedTech');
        }
        function isInventoryUser() {
            return isAdminUser() || isMedTechUser();
        }

        let selectedUserIds = new Set();
        let currentRenderedUserIds = [];

        function renderUsersLogView() {
            const container = document.getElementById('usersLogContainer');
            if (!container) return;
            const adminMode = isAdminUser();

            currentRenderedUserIds = systemUsers.map(u => u.id);
            selectedUserIds.clear();
            refreshUsersDeleteBtn();
            const bulkBar = document.getElementById('usersBulkBar');
            if (bulkBar) bulkBar.style.display = adminMode ? 'flex' : 'none';
            const selectAllBox = document.getElementById('usersSelectAll');
            if (selectAllBox) selectAllBox.checked = false;

            if (systemUsers.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">No registered users found.</div>';
                return;
            }

            container.innerHTML = `
                <div class="approval-table-wrapper">
                    <table class="approval-table">
                        <thead>
                            <tr>
                                ${adminMode ? `<th style="width:30px;"></th>` : ''}
                                <th>Timestamp</th>
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>User Role</th>
                                <th>Contact</th>
                                <th>Action Taken</th>
                                ${adminMode ? `<th>Action</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${systemUsers.map(user => `
                                <tr>
                                    ${adminMode ? `<td><input type="checkbox" class="admin-row-checkbox" style="margin-right:0;" onchange="toggleUserSelect('${esc(user.id)}', this.checked)"></td>` : ''}
                                    <td style="white-space:nowrap;">${formatLoginTimestamp(user.actionAt || user.registeredAt)}</td>
                                    <td style="font-weight:bold;">${esc(user.name)}</td>
                                    <td>${user.username ? '@' + esc(user.username) : 'N/A'}</td>
                                    <td style="min-width:150px;"><span class="role-chip ${user.role === 'Admin' ? 'admin' : (user.role === 'Blood Bank MedTech' ? 'medtech' : 'staff')}">${esc(user.role)}</span></td>
                                    <td>${esc(user.contact || 'N/A')}</td>
                                    <td>
                                        ${esc(user.actionTaken || 'Registered')}
                                        <span style="display:block; font-size:11px; font-weight:bold; margin-top:2px; color:${user.status === 'Approved' ? '#2e7d32' : '#f57f17'};">${esc(user.status || 'Approved')}</span>
                                        ${user.status === 'Approved' && user.approvedBy ? `<span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Approved by: ${esc(user.approvedBy)}</span>` : ''}
                                    </td>
                                    ${adminMode ? `<td><div class="user-action-cell"><button class="admin-bulk-delete-btn active" style="padding:6px 12px;" onclick="deleteSingleUser('${esc(user.id)}')"><i class="fa-solid fa-trash"></i> DELETE</button><span class="user-action-slot">${user.role !== 'Admin' && user.status === 'Approved' ? (user.isDisabled
                                            ? `<button class="req-btn ok" onclick="toggleStaffDisabled('${esc(user.id)}', false)"><i class="fa-solid fa-user-check"></i> ENABLE</button>`
                                            : `<button class="req-btn" style="background:#6b7280;" onclick="toggleStaffDisabled('${esc(user.id)}', true)"><i class="fa-solid fa-user-slash"></i> DISABLE</button>`) : ''}</span></div></td>` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function toggleStaffDisabled(userId, disable) {
            const u = systemUsers.find(x => x.id === userId);
            if (!u) return;
            const msg = disable
                ? `Disable the account of ${u.name}? The account will NOT be deleted — it just can no longer log in until you enable it again. Use this when a staff member provided false, fake, or invalid information, or is no longer part of IT.`
                : `Enable the account of ${u.name}? They will be able to log in again.`;
            showConfirmBox(msg, () => {
                return apiRequest('/admin/staff/' + userId + (disable ? '/disable' : '/enable'), 'PATCH').then(data => {
                    if (data && data.user) {
                        const i = systemUsers.findIndex(x => x.id === userId);
                        if (i !== -1) systemUsers[i] = data.user;
                        localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                    }
                    renderUsersLogView();
                    showAlertBox(disable ? `${u.name}'s account was disabled and recorded in the User Log.` : `${u.name}'s account was enabled and recorded in the User Log.`);
                }).catch(err => showAlertBox(err.message || 'Error: Could not change this account. Please try again.'));
            }, disable ? 'Disable Staff Account' : 'Enable Staff Account');
        }

        function deleteSingleUser(userId) {
            const targetUser = systemUsers.find(u => u.id === userId);
            if (targetUser && targetUser.role === 'Admin' && systemUsers.filter(u => u.role === 'Admin').length <= 1) {
                showAlertBox('The last remaining Admin account cannot be deleted.');
                return;
            }
            showConfirmBox('Are you sure you want to delete this user account?', () => {
                return apiRequest('/api/users/' + userId, 'DELETE').then(() => {
                    systemUsers = systemUsers.filter(u => u.id !== userId);
                    localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                    renderUsersLogView();
                    updateStatisticsData();
                    showAlertBox('The user account was deleted successfully.');
                }).catch(err => {
                    showAlertBox(err.message || 'Could not delete this user from the database. Please try again.');
                });
            }, 'Delete User');
        }

        function formatLoginTimestamp(isoString) {
            if (!isoString) return 'Not yet logged in';
            const dateObj = new Date(isoString);
            if (isNaN(dateObj.getTime())) return 'Not yet logged in';
            const datePart = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const timePart = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            return `${datePart}, ${timePart}`;
        }

        function loadNotificationsStore() {
            return safeParseJSON('redflow_notifications') || {};
        }

        function saveNotificationsStore(store) {
            localStorage.setItem('redflow_notifications', JSON.stringify(store));
        }

        function pushNotification(userId, message) {
            if (!userId) return;
            const store = loadNotificationsStore();
            if (!store[userId]) store[userId] = [];
            store[userId].unshift({
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                message: message,
                timestamp: new Date().toISOString(),
                read: false
            });
            saveNotificationsStore(store);
            updateNotificationBadge();
        }

        function getCurrentUserNotifications() {
            const currentUser = safeParseJSON('redflow_current_user');
            if (!currentUser) return [];
            const store = loadNotificationsStore();
            return (store[currentUser.id] || []).filter(n => !['create_donor', 'update_donor', 'update_record'].includes(notifCategory(n)));
        }

        function updateNotificationBadge() {
            const dot = document.getElementById('notifBadgeDot');
            if (!dot) return;
            const unreadCount = getCurrentUserNotifications().filter(n => !n.read).length;
            if (unreadCount > 0) {
                dot.innerText = unreadCount > 99 ? '99+' : unreadCount;
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
        }

        const NOTIF_CATEGORIES = [
            ['login', 'Login Alert', 'fa-right-to-bracket'],
            ['staff_account', 'Staff Account (Needs Approval)', 'fa-user-check'],
            ['donor_pending', 'Donor Screening', 'fa-user-plus'],
            ['edit_request', 'Submitted Request (Donor Update)', 'fa-code-pull-request'],
            ['blood_expiry', 'Blood Expiration Alert', 'fa-triangle-exclamation'],
            ['password', 'Change Password', 'fa-key'],
            ['other', 'Others', 'fa-bell']
        ];
        let notifFilter = 'all';
        function notifCategory(n) {
            if (n.category && n.category !== 'other') return n.category;
            const m = String(n.message || '').toLowerCase();
            if (m.includes('was logged in')) return 'login';
            if (m.includes('sign-up request') || m.includes('staff account has been approved')) return 'staff_account';
            if (m.includes('edit request') || m.includes('history record for donor')) return 'edit_request';
            if (m.includes('added a new donor')) return 'create_donor';
            if (m.includes('donor profile') || m.includes('from the masterlist')) return 'update_donor';
            if (m.includes('history record')) return 'update_record';
            if (m.includes('password') || m.includes('email address was changed')) return 'password';
            return 'other';
        }
        function setNotifFilter(f) { notifFilter = f; renderNotificationsView(); }
        function markNotifGroupRead(cat, read) {
            const me = safeParseJSON('redflow_current_user');
            if (!me) return;
            const store = loadNotificationsStore();
            const ids = [];
            (store[me.id] || []).forEach(n => { if (notifCategory(n) === cat && !!n.read !== !!read) { n.read = !!read; ids.push(n.id); } });
            if (ids.length === 0) return;
            saveNotificationsStore(store);
            ids.forEach(id => apiRequest('/api/notifications/' + id + '/read', 'PATCH', { read: !!read }).catch(() => {}));
            renderNotificationsView();
            updateNotificationBadge();
        }
        function deleteNotifGroup(cat) {
            const ids = getCurrentUserNotifications().filter(n => notifCategory(n) === cat).map(n => n.id);
            if (ids.length === 0) return;
            const meta = NOTIF_CATEGORIES.find(c => c[0] === cat);
            showConfirmBox(`⚠️ Delete all ${ids.length} "${meta ? meta[1].split(' (')[0] : 'these'}" notification${ids.length === 1 ? '' : 's'}? They will be permanently deleted.`, () => {
                removeNotifications(ids);
            }, 'Delete All');
        }
        function removeNotifications(ids) {
            const me = safeParseJSON('redflow_current_user');
            if (!me) return;
            const store = loadNotificationsStore();
            store[me.id] = (store[me.id] || []).filter(n => !ids.includes(n.id));
            saveNotificationsStore(store);
            renderNotificationsView();
            updateStatisticsData();
            updateNotificationBadge();
            showAlertBox(ids.length === 1 ? 'The notification was deleted successfully.' : `${ids.length} notifications were deleted successfully.`);
            Promise.all(ids.map(id => apiRequest('/api/notifications/' + id, 'DELETE'))).catch(() => {
                showAlertBox('Warning: Could not confirm the delete with the server. If you are offline, some notifications may reappear after you log back in.');
            });
        }
        function notifItemHtml(n) {
            return `
                    <div class="notif-item ${n.read ? '' : 'unread'}">
                        <div class="notif-item-main">
                            <div class="notif-item-icon"><i class="fa-solid fa-bell"></i></div>
                            <div>
                                <p class="notif-item-message">${esc(n.message)}</p>
                                <span class="notif-item-time">${formatLoginTimestamp(n.timestamp)}</span>
                            </div>
                        </div>
                        <div class="notif-item-actions">
                            <button class="notif-item-read-btn" aria-label="${n.read ? 'Mark as unread' : 'Mark as read'}" onclick="setNotificationRead('${esc(n.id)}', ${n.read ? 'false' : 'true'})"><i class="fa-solid ${n.read ? 'fa-envelope' : 'fa-envelope-open'}"></i></button>
                            <button class="notif-item-delete-btn" title="Delete notification" onclick="deleteNotification('${esc(n.id)}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>`;
        }
        function renderNotificationsView() {
            const container = document.getElementById('notificationsListContainer');
            if (!container) return;
            const notifs = getCurrentUserNotifications();
            const groups = {};
            NOTIF_CATEGORIES.forEach(c => groups[c[0]] = []);
            notifs.forEach(n => { (groups[notifCategory(n)] || groups.other).push(n); });
            if (notifFilter !== 'all' && groups[notifFilter] && groups[notifFilter].length === 0) notifFilter = 'all';
            const chips = notifs.length === 0 ? '' : `<div class="notif-chips">
                <button class="notif-chip ${notifFilter === 'all' ? 'active' : ''}" onclick="setNotifFilter('all')">All<span class="cnt">${notifs.length}</span></button>
                ${NOTIF_CATEGORIES.filter(c => groups[c[0]].length > 0).map(c => `<button class="notif-chip ${notifFilter === c[0] ? 'active' : ''}" onclick="setNotifFilter('${c[0]}')">${esc(c[1].split(' (')[0])}<span class="cnt">${groups[c[0]].length}</span></button>`).join('')}
            </div>`;
            const shown = NOTIF_CATEGORIES.filter(c => groups[c[0]].length > 0 && (notifFilter === 'all' || notifFilter === c[0]));
            let body;
            if (shown.length === 0) {
                body = `<p style="text-align:center; color:var(--text-muted); padding:30px 10px;">${notifs.length === 0 ? 'No notifications yet.' : 'No notifications in this category.'}</p>`;
            } else {
                body = shown.map(c => `
                    <div class="notif-group-title"><i class="fa-solid ${c[2]}"></i> ${esc(c[1])} <span class="cnt">${groups[c[0]].length}</span>
                        <span class="notif-group-actions">
                            ${groups[c[0]].some(n => !n.read)
                                ? `<button class="notif-delall-btn read" onclick="markNotifGroupRead('${c[0]}', true)"><i class="fa-solid fa-envelope-open"></i> Mark as Read</button>`
                                : `<button class="notif-delall-btn read" onclick="markNotifGroupRead('${c[0]}', false)"><i class="fa-solid fa-envelope"></i> Mark as Unread</button>`}
                            <button class="notif-delall-btn" onclick="deleteNotifGroup('${c[0]}')"><i class="fa-solid fa-trash"></i> Delete all</button>
                        </span></div>
                    ${groups[c[0]].map(notifItemHtml).join('')}`).join('');
            }
            container.innerHTML = chips + body;
            updateNotificationBadge();
        }

        function markNotificationsAsRead() {
            const currentUser = safeParseJSON('redflow_current_user');
            if (!currentUser) return;
            const store = loadNotificationsStore();
            if (store[currentUser.id]) {
                store[currentUser.id].forEach(n => n.read = true);
                saveNotificationsStore(store);
            }
            updateNotificationBadge();
        }

        function setNotificationRead(notifId, makeRead) {
            const currentUser = safeParseJSON('redflow_current_user');
            if (!currentUser) return;
            showConfirmBox(makeRead ? 'This notification will be marked as read.' : 'This notification will be marked as unread.', () => {
                const store = loadNotificationsStore();
                const list = store[currentUser.id] || [];
                const n = list.find(x => x.id === notifId);
                if (!n) return;
                n.read = makeRead;
                saveNotificationsStore(store);
                renderNotificationsView();
                updateNotificationBadge();
                apiRequest('/api/notifications/' + notifId + '/read', 'PATCH', { read: makeRead }).catch(() => {
                    showAlertBox('Warning: Could not save this change to the server. If you are offline, it may go back after you log in again — please try again once you are back online.');
                });
            }, makeRead ? 'Mark as Read' : 'Mark as Unread');
        }

        function deleteNotification(notifId) {
            const currentUser = safeParseJSON('redflow_current_user');
            if (!currentUser) return;
            showConfirmBox('Delete this notification? It will be permanently deleted.', () => {
                const store = loadNotificationsStore();
                if (!store[currentUser.id]) return;
                store[currentUser.id] = store[currentUser.id].filter(n => n.id !== notifId);
                saveNotificationsStore(store);
                renderNotificationsView();
                updateStatisticsData();
                updateNotificationBadge();
                showAlertBox('The notification was deleted successfully.');
                apiRequest('/api/notifications/' + notifId, 'DELETE').catch(() => {
                    showAlertBox('Warning: Could not confirm the delete with the server. If you are offline, this notification may reappear after you log back in — please try again once you are back online.');
                });
            }, 'Delete Notification');
        }

        function clearAllNotifications() {
            const currentUser = safeParseJSON('redflow_current_user');
            if (!currentUser) return;
            const notifs = getCurrentUserNotifications();
            if (notifs.length === 0) return;
            showConfirmBox('Delete all your notifications? They will be permanently deleted.', () => {
                const store = loadNotificationsStore();
                store[currentUser.id] = [];
                saveNotificationsStore(store);
                renderNotificationsView();
                updateStatisticsData();
                updateNotificationBadge();
                showAlertBox('All notifications were deleted successfully.');
                apiRequest('/api/notifications', 'DELETE').catch(() => {
                    showAlertBox('Warning: Could not confirm the delete with the server. If you are offline, these notifications may reappear after you log back in — please try again once you are back online.');
                });
            }, 'Clear All Notifications');
        }

        function toggleUserSelect(id, checked) {
            if (checked) selectedUserIds.add(id); else selectedUserIds.delete(id);
            refreshUsersDeleteBtn();
        }

        function refreshUsersDeleteBtn() {
            const btn = document.getElementById('usersDeleteBtn');
            if (!btn) return;
            btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selectedUserIds.size})`;
            btn.classList.toggle('active', selectedUserIds.size > 0);
        }

        function toggleSelectAllUsers(checked) {
            document.querySelectorAll('#usersLogContainer .admin-row-checkbox').forEach(cb => cb.checked = checked);
            if (checked) currentRenderedUserIds.forEach(id => selectedUserIds.add(id));
            else selectedUserIds.clear();
            refreshUsersDeleteBtn();
        }

        function deleteSelectedUsers() {
            if (selectedUserIds.size === 0) return;
            const idsArray = Array.from(selectedUserIds);
            const selectedAdmins = systemUsers.filter(u => idsArray.includes(u.id) && u.role === 'Admin');
            const totalAdmins = systemUsers.filter(u => u.role === 'Admin').length;
            if (selectedAdmins.length > 0 && selectedAdmins.length >= totalAdmins) {
                showAlertBox('The last remaining Admin account cannot be deleted.');
                return;
            }
            showConfirmBox(`Are you sure you want to delete ${selectedUserIds.size} selected user(s)?`, () => {
                return apiRequest('/api/users/bulk', 'DELETE', { ids: idsArray }).then(data => {
                    systemUsers = systemUsers.filter(u => !selectedUserIds.has(u.id));
                    localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                    selectedUserIds.clear();
                    renderUsersLogView();
                    updateStatisticsData();
                    if (data && data.skipped && data.skipped.length > 0) {
                        showAlertBox('Note: ' + data.skipped.join(', ') + ' was not deleted (last remaining Admin account).');
                    } else {
                        showAlertBox('Selected users were deleted successfully.');
                    }
                }).catch(err => {
                    showAlertBox(err.message || 'Could not delete these users from the database. Please try again.');
                });
            }, 'Delete Users');
        }

        const LOGIN_MAX_ATTEMPTS = 5;
        const LOGIN_LOCKOUT_MS = 60000;

        function getLoginAttemptsStore() {
            return safeParseJSON('redflow_login_attempts') || {};
        }
        function saveLoginAttemptsStore(store) {
            localStorage.setItem('redflow_login_attempts', JSON.stringify(store));
        }
        function getRemainingLockoutSeconds(email) {
            const store = getLoginAttemptsStore();
            const entry = store[email];
            if (!entry || !entry.lockUntil) return 0;
            const remainingMs = entry.lockUntil - Date.now();
            return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
        }
        function registerFailedLoginAttempt(email) {
            const store = getLoginAttemptsStore();
            const entry = store[email] || { count: 0, lockUntil: 0 };
            entry.count = (entry.count || 0) + 1;
            if (entry.count >= LOGIN_MAX_ATTEMPTS) {
                entry.lockUntil = Date.now() + LOGIN_LOCKOUT_MS;
                entry.count = 0;
            }
            store[email] = entry;
            saveLoginAttemptsStore(store);
        }
        function clearFailedLoginAttempts(email) {
            const store = getLoginAttemptsStore();
            if (store[email]) {
                delete store[email];
                saveLoginAttemptsStore(store);
            }
        }

        function handleLogin() {
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const loginBtn = document.querySelector('#loginView .login-btn, #loginView .action-main-btn, #loginView button[onclick="handleLogin()"]');
            const loginBtnOriginalText = loginBtn ? loginBtn.innerHTML : '';
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.style.opacity = '0.7';
                loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
            }

            apiRequest('/login', 'POST', { email, password }).then(data => {
                const user = data && data.user;
                if (!user) {
                    throw new Error('Login did not return account data. Please try again.');
                }
                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                if (csrfMeta && data.csrf_token) csrfMeta.content = data.csrf_token;

                sessionExpiredHandled = false;
                localStorage.setItem('redflow_logged_in', 'true');
                localStorage.setItem('redflow_current_user', JSON.stringify(user));

                staffData = syncStaffDataFromUser(user);
                localStorage.setItem('redflow_staff_profile', JSON.stringify(staffData));
                refreshHeaderAvatar();

                document.getElementById('loginView').classList.add('hidden');
                document.getElementById('mainAppContainer').style.display = 'block';

                setupSidebarByRole(user);
                isSidebarOpen = window.innerWidth > 768;
                applySidebarState();

                setTimeout(() => {
                    renderDonorCards();
                    renderMonitoringTable();
                    renderAdminApprovalPageView();
                    renderUsersLogView();
                    updateNotificationBadge();
                    hydrateAppDataFromServer();
                }, 100);
                showAlertBox(`Logged in successfully as ${user.role}!`);
            }).catch(err => {
                showAlertBox(err.message || 'Error: Incorrect Email or Password! Please check your credentials.');
            }).finally(() => {
                if (loginBtn) { loginBtn.disabled = false; loginBtn.style.opacity = '1'; loginBtn.innerHTML = loginBtnOriginalText; }
            });
        }

        let suData = {};
        let suSelfieStream = null;
        let suSelfieCaptured = false;

        function openSignupWizard() {
            suData = { frontId: null, backId: null, faceDoc: null };
            suSelfieCaptured = false;
            const ids = ['suFullname','suUsername','suContact','suDob','suGender','suBrgy','suEmail','suPassword','suConfirmPassword'];
            ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            document.getElementById('suTermsConsent').checked = false;
            document.getElementById('suPrivacyConsent').checked = false;
            suUsernameTouched = false; suUsernameOk = false;
            const dobEl = document.getElementById('suDob'); if (dobEl) dobEl.max = maxAdultBirthdateISO();
            ['suUsernameHint','suEmailHint'].forEach(i => { const h = document.getElementById(i); if (h) { h.textContent = ''; h.className = 'su-hint'; } });
            const uc = document.getElementById('suUsernameChips'); if (uc) uc.innerHTML = '';
            document.getElementById('suIdFrontStatus').textContent = 'Take a photo of your ID';
            document.getElementById('suIdFrontStatus').style.color = '';
            document.getElementById('suIdFrontPreview').style.display = 'none';
            document.getElementById('suIdBackStatus').textContent = 'Take a photo of your ID';
            document.getElementById('suIdBackStatus').style.color = '';
            document.getElementById('suIdBackPreview').style.display = 'none';
            goToSignupStep(1);
            openModal('signupModal');
        }

        function closeSignupWizard() {
            stopSuSelfieCamera();
            closeModal('signupModal');
        }

        let fpVerifiedCode = '';
        let fpTargetEmail = '';

        function openForgotPasswordModal() {
            fpVerifiedCode = '';
            fpTargetEmail = '';
            document.getElementById('fpEmailInput').value = '';
            document.querySelectorAll('.fp-otp').forEach(input => input.value = '');
            document.getElementById('fpNewPassword').value = '';
            document.getElementById('fpConfirmPassword').value = '';
            goToFpStep(1);
            openModal('forgotPasswordModal');
        }

        function closeForgotPasswordModal() {
            closeModal('forgotPasswordModal');
        }

        function goToFpStep(stepNumber) {
            document.querySelectorAll('#forgotPasswordModal .su-step').forEach(panel => panel.classList.remove('active'));
            document.getElementById('fp-step-' + stepNumber).classList.add('active');
        }

        function validateFpStep1() {
            const email = document.getElementById('fpEmailInput').value.trim().toLowerCase();
            if (!email) {
                showAlertBox('Please enter your registered email address.');
                return;
            }

            fpTargetEmail = email;

            const btn = document.getElementById('fpSendCodeBtn');
            btn.textContent = 'Sending...';
            btn.disabled = true;

            apiRequest('/forgot-password/send-otp', 'POST', { email: email }).then(() => {
                document.getElementById('fpEmailTargetText').textContent = `Check ${email} for your 6-digit code.`;
                btn.textContent = 'Send Code';
                btn.disabled = false;
                goToFpStep(2);
            }).catch(err => {
                showAlertBox(err.isNetworkError ? FP_EMAIL_FAIL_MSG : (err.message || FP_EMAIL_FAIL_MSG));
                btn.textContent = 'Send Code';
                btn.disabled = false;
            });
        }

        const RESEND_COOLDOWN_SECONDS = 60;

        function startResendCooldown(btn, seconds) {
            let left = seconds;
            btn.disabled = true;
            btn.textContent = `Resend in ${left}s`;
            const timer = setInterval(() => {
                left--;
                if (left <= 0) {
                    clearInterval(timer);
                    btn.disabled = false;
                    btn.textContent = 'Resend';
                } else {
                    btn.textContent = `Resend in ${left}s`;
                }
            }, 1000);
        }

        function resendOtpWithFeedback(btn, url, email, sentMessage, onNoEmail) {
            if (btn && btn.disabled) return;
            if (!email) { if (onNoEmail) onNoEmail(); return; }
            if (!navigator.onLine) { showAlertBox(FP_EMAIL_FAIL_MSG); return; }
            if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
            apiRequest(url, 'POST', { email: email }).then(() => {
                if (btn) startResendCooldown(btn, RESEND_COOLDOWN_SECONDS);
                showAlertBox(sentMessage);
            }).catch(err => {
                if (btn) { btn.disabled = false; btn.textContent = 'Resend'; }
                showAlertBox(err.isNetworkError ? FP_EMAIL_FAIL_MSG : (err.message || FP_EMAIL_FAIL_MSG));
            });
        }

        function resendFpCode(btn) {
            resendOtpWithFeedback(btn, '/forgot-password/send-otp', fpTargetEmail,
                `A new verification code has been resent to ${fpTargetEmail}.`,
                () => goToFpStep(1));
        }

        function validateFpStep2(event) {
            const otpInputs = document.querySelectorAll('.fp-otp');
            let enteredCode = '';
            otpInputs.forEach(input => { enteredCode += input.value.trim(); });

            if (enteredCode.length < 6) {
                showAlertBox('Please enter the complete 6-digit verification code.');
                return;
            }

            const btn = event ? event.currentTarget : document.querySelector('#fp-step-2 .wizard-btn-next');
            const btnOriginal = btn ? btn.innerHTML : '';
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...'; }

            apiRequest('/forgot-password/verify-otp', 'POST', { email: fpTargetEmail, code: enteredCode }).then(() => {
                fpVerifiedCode = enteredCode;
                goToFpStep(3);
            }).catch(err => {
                showAlertBox(err.message || 'Error: Invalid verification code. Please try again.');
            }).finally(() => {
                if (btn) { btn.disabled = false; btn.innerHTML = btnOriginal; }
            });
        }

        function validateFpResetPassword() {
            const p1 = document.getElementById('fpNewPassword').value;
            const p2 = document.getElementById('fpConfirmPassword').value;

            if (!p1 || !p2) {
                showAlertBox('Please fill in both password fields.');
                return;
            }
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(p1)) {
                showAlertBox('Password must be at least 8 characters long and contain both numbers and symbols.');
                return;
            }
            if (p1 !== p2) {
                showAlertBox('Error: Passwords do not match!');
                return;
            }

            const btn = document.querySelector('#fp-step-3 .wizard-btn-next');
            if (btn) { btn.disabled = true; btn.textContent = 'Resetting...'; }

            apiRequest('/forgot-password/reset', 'POST', { email: fpTargetEmail, code: fpVerifiedCode, password: p1 }).then(() => {
                showAlertBox('Password successfully reset! You may now log in with your new password.');
                closeForgotPasswordModal();
            }).catch(err => {
                showAlertBox(err.message || 'Error: Could not reset the password. Please try again.');
            }).finally(() => {
                if (btn) { btn.disabled = false; btn.textContent = 'Reset Password'; }
            });
        }

        function goToSignupStep(stepNumber) {
            document.querySelectorAll('#signupModal .su-step').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById('su-step-' + stepNumber).classList.add('active');
            if (stepNumber === 5) {
                startSuSelfieCamera();
            }
        }

        function validateSuStep1() {
            const termsChecked = document.getElementById('suTermsConsent').checked;
            const privacyChecked = document.getElementById('suPrivacyConsent').checked;
            if (!termsChecked || !privacyChecked) {
                showAlertBox('Please check and agree to both the Terms and Conditions and Data Privacy Policy before proceeding.');
                return;
            }
            goToSignupStep(2);
        }

        let suUsernameTouched = false;
        let suUsernameOk = false;
        let suUsernameTimer = null;
        function suSlug(name) {
            return String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
        }
        function suSuggestUsernames(name) {
            const parts = suSlug(name).split(/\s+/).filter(Boolean);
            if (parts.length === 0) return [];
            const first = parts[0], last = parts[parts.length - 1];
            const out = [];
            if (parts.length > 1) { out.push(first + '.' + last, first + last, first + '_' + last, first + '.' + last[0]); }
            else { out.push(first); }
            out.push((parts.length > 1 ? first + last : first) + Math.floor(10 + Math.random() * 89));
            return Array.from(new Set(out.map(u => u.padEnd(4, '0').slice(0, 30))));
        }
        function suOnFullnameInput() {
            const name = document.getElementById('suFullname').value;
            const chips = document.getElementById('suUsernameChips');
            const list = suSuggestUsernames(name);
            if (chips) chips.innerHTML = list.slice(0, 4).map(u => `<button type="button" class="su-chip" onclick="suPickUsername('${esc(u)}')">@${esc(u)}</button>`).join('');
            if (!suUsernameTouched && list.length) {
                document.getElementById('suUsername').value = list[0];
                suCheckUsername();
            }
        }
        function suPickUsername(u) {
            suUsernameTouched = true;
            document.getElementById('suUsername').value = u;
            suCheckUsername();
        }
        function suOnUsernameInput() {
            suUsernameTouched = true;
            const el = document.getElementById('suUsername');
            el.value = el.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
            clearTimeout(suUsernameTimer);
            suUsernameTimer = setTimeout(suCheckUsername, 350);
        }
        function suCheckUsername() {
            const u = document.getElementById('suUsername').value.trim().toLowerCase();
            const hint = document.getElementById('suUsernameHint');
            suUsernameOk = false;
            if (!/^[a-z0-9._]{4,30}$/.test(u)) {
                hint.className = 'su-hint bad';
                hint.textContent = 'Username must be 4–30 characters: letters, numbers, dot (.) or underscore (_).';
                return Promise.resolve(false);
            }
            return apiRequest('/username-available?username=' + encodeURIComponent(u)).then(r => {
                if (document.getElementById('suUsername').value.trim().toLowerCase() !== u) return false;
                if (r.available) { hint.className = 'su-hint good'; hint.textContent = '✓ @' + u + ' is available.'; suUsernameOk = true; return true; }
                hint.className = 'su-hint bad';
                hint.textContent = 'That username is already taken.' + (r.suggestion ? ' Try @' + r.suggestion : '');
                return false;
            }).catch(() => { suUsernameOk = true; return true;  });
        }

        function validateSuStep2() {
            const fullname = document.getElementById('suFullname').value.trim();
            const username = document.getElementById('suUsername').value.trim().toLowerCase();
            const dob = document.getElementById('suDob').value;
            const gender = document.getElementById('suGender').value;
            if (!fullname || !username || !document.getElementById('suContact').value.trim() || !dob || !gender) {
                showAlertBox(REQUIRED_MSG);
                return;
            }
            if (!isValidPh10('suContact')) {
                showAlertBox('Please enter your complete contact number after +63 (e.g. 9171234567).');
                return;
            }
            const bErr = birthdateError(dob, 'staff');
            if (bErr) { showAlertBox(bErr); return; }
            suCheckUsername().then(ok => {
                if (!ok) { showAlertBox('Please choose a valid, available username before continuing.'); return; }
                suData.fullname = fullname;
                suData.username = username;
                suData.contact = phoneFull('suContact');
                suData.dob = dob;
                suData.gender = gender;
                suData.role = 'Staff';
                goToSignupStep(3);
            });
        }

        function validateSuStep3() {
            const brgy = document.getElementById('suBrgy').value;
            if (!brgy) {
                showAlertBox('Please select your Barangay.');
                return;
            }
            suData.brgy = brgy;
            goToSignupStep(4);
        }

        function handleSuIdUpload(input, side) {
            if (input.files && input.files[0]) {
                const statusEl = document.getElementById(side === 'front' ? 'suIdFrontStatus' : 'suIdBackStatus');
                const box = statusEl ? statusEl.closest('.su-id-box') : null;
                if (statusEl) {
                    statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
                    statusEl.style.color = 'var(--text-muted)';
                }
                if (box) box.style.pointerEvents = 'none';

                const reader = new FileReader();
                reader.onload = function(e) {
                    if (side === 'front') {
                        suData.frontId = e.target.result;
                    } else {
                        suData.backId = e.target.result;
                    }
                    if (statusEl) {
                        statusEl.textContent = (side === 'front' ? '✓ Front ID Captured' : '✓ Back ID Captured');
                        statusEl.style.color = 'var(--success-green)';
                    }
                    const prev = document.getElementById(side === 'front' ? 'suIdFrontPreview' : 'suIdBackPreview');
                    if (prev) { prev.src = e.target.result; prev.style.display = 'block'; }
                    if (box) box.style.pointerEvents = '';
                };
                reader.onerror = function() {
                    if (statusEl) {
                        statusEl.textContent = 'Upload failed — tap to try again';
                        statusEl.style.color = 'var(--primary-red)';
                    }
                    if (box) box.style.pointerEvents = '';
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        const CamGuard = (function () {
            const work = document.createElement('canvas');
            const wctx = work.getContext('2d', { willReadFrequently: true });
            let nativeDetector = null;
            let nativeChecked = false;

            function getNativeDetector() {
                if (nativeChecked) return nativeDetector;
                nativeChecked = true;
                try {
                    if ('FaceDetector' in window) nativeDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
                } catch (e) { nativeDetector = null; }
                return nativeDetector;
            }

            const BLUR_MIN_ID = 30;
            const BLUR_MIN_FACE = 8;
            const MOTION_MAX = 9;
            let prevSig = null;

            function resetMotion() { prevSig = null; }

            function lapVariance(gray, w, h, x0, y0, x1, y1) {
                x0 = Math.max(1, Math.round(x0)); y0 = Math.max(1, Math.round(y0));
                x1 = Math.min(w - 1, Math.round(x1)); y1 = Math.min(h - 1, Math.round(y1));
                let sum = 0, sq = 0, n = 0;
                for (let y = y0; y < y1; y++) {
                    for (let x = x0; x < x1; x++) {
                        const i = y * w + x;
                        const l = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
                        sum += l; sq += l * l; n++;
                    }
                }
                if (!n) return 0;
                const mean = sum / n;
                return sq / n - mean * mean;
            }

            function motionLevel(gray, w, h) {
                const gx = 24, gy = 18;
                const sig = new Float32Array(gx * gy);
                for (let j = 0; j < gy; j++) {
                    for (let i = 0; i < gx; i++) {
                        sig[j * gx + i] = gray[Math.floor((j + 0.5) * h / gy) * w + Math.floor((i + 0.5) * w / gx)];
                    }
                }
                let diff = 0;
                if (prevSig) {
                    for (let k = 0; k < sig.length; k++) diff += Math.abs(sig[k] - prevSig[k]);
                    diff /= sig.length;
                }
                prevSig = sig;
                return diff;
            }

            function toGray(data, w, h) {
                const gray = new Float32Array(w * h);
                for (let i = 0, p = 0; i < gray.length; i++, p += 4) gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
                return gray;
            }

            function faceClarity(video) {
                const img = grab(video, 160);
                const gray = toGray(img.data, img.w, img.h);
                const o = ovalGeometry(img.w, img.h);
                if (motionLevel(gray, img.w, img.h) > MOTION_MAX) return { ok: false, hint: 'Hold still. Your photo may turn out blurry.' };
                if (lapVariance(gray, img.w, img.h, o.cx - o.rx, o.cy - o.ry, o.cx + o.rx, o.cy + o.ry) < BLUR_MIN_FACE) {
                    return { ok: false, hint: 'Image is blurry. Hold steady and make sure the camera lens is clean.' };
                }
                return { ok: true };
            }

            function visibleCrop(video) {
                const vw = video.videoWidth, vh = video.videoHeight;
                const cw = video.clientWidth || vw, ch = video.clientHeight || vh;
                const scale = Math.max(cw / vw, ch / vh);
                const sw = cw / scale, sh = ch / scale;
                return { sx: (vw - sw) / 2, sy: (vh - sh) / 2, sw, sh, cw, ch };
            }

            function grab(video, targetW) {
                const crop = visibleCrop(video);
                const w = targetW, h = Math.max(1, Math.round(targetW * crop.sh / crop.sw));
                work.width = w; work.height = h;
                wctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
                return { data: wctx.getImageData(0, 0, w, h).data, w, h, crop };
            }

            function ovalGeometry(w, h) {
                return { cx: w / 2, cy: h * 0.40, rx: w * 0.17, ry: h * 0.29 };
            }

            function isSkin(r, g, b) {
                const y = 0.299 * r + 0.587 * g + 0.114 * b;
                const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
                const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
                return y > 45 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
            }

            function analyzeFaceHeuristic(video) {
                const img = grab(video, 160);
                const { data, w, h } = img;
                const o = ovalGeometry(w, h);
                let inside = 0, skin = 0, sumY = 0, sx = 0, sy = 0;
                let eyeL = 0, eyeLn = 0, eyeR = 0, eyeRn = 0, mouth = 0, mouthN = 0;
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const dx = (x - o.cx) / o.rx, dy = (y - o.cy) / o.ry;
                        if (dx * dx + dy * dy > 1) continue;
                        const i = (y * w + x) * 4;
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                        inside++; sumY += lum;
                        const sk = isSkin(r, g, b);
                        if (sk) { skin++; sx += x; sy += y; }
                        if (dy > -0.45 && dy < -0.05) {
                            if (dx < -0.12 && dx > -0.75) { eyeLn++; if (lum < 70) eyeL++; }
                            else if (dx > 0.12 && dx < 0.75) { eyeRn++; if (lum < 70) eyeR++; }
                        } else if (dy > 0.35 && dy < 0.7 && Math.abs(dx) < 0.45) {
                            mouthN++;
                            if (lum < 85 || (r > 120 && r - g > 55 && r - b > 35)) mouth++;
                        }
                    }
                }
                if (!inside) return { ok: false, hint: 'Camera is not ready yet.' };
                const meanY = sumY / inside;
                if (meanY < 45) return { ok: false, hint: 'Too dark. Move to a brighter place.' };
                if (meanY > 235) return { ok: false, hint: 'Too bright. Avoid direct light behind or on your face.' };
                const skinRatio = skin / inside;
                if (skinRatio < 0.42) return { ok: false, hint: 'No face detected. Place your face inside the oval.' };
                const cxs = sx / skin, cys = sy / skin;
                if (Math.abs(cxs - o.cx) > o.rx * 0.38 || Math.abs(cys - o.cy) > o.ry * 0.42) {
                    return { ok: false, hint: 'Center your face inside the oval.' };
                }
                const eyesOk = eyeLn && eyeRn && (eyeL / eyeLn) >= 0.025 && (eyeR / eyeRn) >= 0.025;
                const mouthOk = mouthN && (mouth / mouthN) >= 0.02;
                if (!eyesOk || !mouthOk) return { ok: false, hint: 'Face not clear. Look straight at the camera and remove anything covering your face.' };
                return { ok: true, hint: 'Face detected. Hold still.' };
            }

            async function analyzeFacePosition(video) {
                if (!video || !video.videoWidth) return { ok: false, hint: 'Camera is not ready yet.' };
                const det = getNativeDetector();
                if (det) {
                    try {
                        const img = grab(video, 320);
                        const faces = await det.detect(work);
                        if (!faces.length) return { ok: false, hint: 'No face detected. Place your face inside the oval.' };
                        if (faces.length > 1) return { ok: false, hint: 'Only one person should be in the frame.' };
                        const bb = faces[0].boundingBox;
                        const o = ovalGeometry(img.w, img.h);
                        const fx = bb.x + bb.width / 2, fy = bb.y + bb.height / 2;
                        if (Math.abs(fx - o.cx) > o.rx * 0.4 || Math.abs(fy - o.cy) > o.ry * 0.4) return { ok: false, hint: 'Center your face inside the oval.' };
                        const ratio = bb.width / (o.rx * 2);
                        if (ratio < 0.6) return { ok: false, hint: 'Move closer to the camera.' };
                        if (ratio > 1.25) return { ok: false, hint: 'Move a little farther from the camera.' };
                        return { ok: true, hint: 'Face detected. Hold still.' };
                    } catch (e) {
                        nativeDetector = null;
                    }
                }
                return analyzeFaceHeuristic(video);
            }

            async function analyzeFace(video) {
                const pos = await analyzeFacePosition(video);
                if (!pos.ok) { resetMotion(); return pos; }
                const clear = faceClarity(video);
                if (!clear.ok) return clear;
                return { ok: true, hint: 'Face is clear. Hold still, capturing automatically...' };
            }

            function idGuideRect(video) {
                const crop = visibleCrop(video);
                let gw = crop.cw * 0.88, gh = gw / 1.586;
                if (gh > crop.ch * 0.88) { gh = crop.ch * 0.88; gw = gh * 1.586; }
                return { left: (crop.cw - gw) / 2, top: (crop.ch - gh) / 2, width: gw, height: gh, cw: crop.cw, ch: crop.ch };
            }

            function lineContrast(gray, w, h, side, rect, off) {
                const x0 = Math.round(rect.x0), x1 = Math.round(rect.x1), y0 = Math.round(rect.y0), y1 = Math.round(rect.y1);
                const gap = 3;
                let good = 0, total = 0;
                const at = (x, y) => gray[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
                if (side === 'top' || side === 'bottom') {
                    const y = (side === 'top' ? y0 : y1) + off;
                    const dir = side === 'top' ? 1 : -1;
                    const from = x0 + Math.round((x1 - x0) * 0.12), to = x1 - Math.round((x1 - x0) * 0.12);
                    for (let x = from; x < to; x += 2) {
                        const inner = (at(x, y + dir * gap) + at(x, y + dir * (gap + 1))) / 2;
                        const outer = (at(x, y - dir * gap) + at(x, y - dir * (gap + 1))) / 2;
                        total++;
                        if (Math.abs(inner - outer) >= 14) good++;
                    }
                } else {
                    const x = (side === 'left' ? x0 : x1) + off;
                    const dir = side === 'left' ? 1 : -1;
                    const from = y0 + Math.round((y1 - y0) * 0.12), to = y1 - Math.round((y1 - y0) * 0.12);
                    for (let y = from; y < to; y += 2) {
                        const inner = (at(x + dir * gap, y) + at(x + dir * (gap + 1), y)) / 2;
                        const outer = (at(x - dir * gap, y) + at(x - dir * (gap + 1), y)) / 2;
                        total++;
                        if (Math.abs(inner - outer) >= 14) good++;
                    }
                }
                return total ? good / total : 0;
            }

            function analyzeId(video) {
                if (!video || !video.videoWidth) return { ok: false, hint: 'Camera is not ready yet.' };
                const img = grab(video, 240);
                const { data, w, h } = img;
                const g = idGuideRect(video);
                const kx = w / g.cw, ky = h / g.ch;
                const rect = { x0: g.left * kx, y0: g.top * ky, x1: (g.left + g.width) * kx, y1: (g.top + g.height) * ky };
                const gray = new Float32Array(w * h);
                for (let i = 0, p = 0; i < gray.length; i++, p += 4) gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];

                let sum = 0, sq = 0, n = 0, grad = 0;
                const ix0 = Math.round(rect.x0) + 4, ix1 = Math.round(rect.x1) - 4, iy0 = Math.round(rect.y0) + 4, iy1 = Math.round(rect.y1) - 4;
                for (let y = iy0; y < iy1; y += 2) {
                    for (let x = ix0; x < ix1; x += 2) {
                        const v = gray[y * w + x];
                        sum += v; sq += v * v; n++;
                        grad += Math.abs(v - gray[y * w + x + 1]) + Math.abs(v - gray[(y + 1) * w + x]);
                    }
                }
                if (!n) return { ok: false, hint: 'Camera is not ready yet.' };
                const mean = sum / n, std = Math.sqrt(Math.max(0, sq / n - mean * mean)), meanGrad = grad / n / 2;
                if (mean < 40) return { ok: false, hint: 'Too dark. Move to a brighter place.' };
                if (std < 18 || meanGrad < 3.2) return { ok: false, hint: 'ID not detected. Place the whole ID inside the frame and keep it steady.' };

                const sides = ['top', 'bottom', 'left', 'right'];
                const missing = [];
                sides.forEach(side => {
                    let best = 0;
                    for (let off = -5; off <= 5; off++) best = Math.max(best, lineContrast(gray, w, h, side, rect, off));
                    if (best < 0.55) missing.push(side);
                });
                if (missing.length) {
                    prevSig = null;
                    return { ok: false, hint: 'Full ID not visible. Fit all four edges of the ID inside the frame (' + missing.join(', ') + ' edge missing).' };
                }
                if (motionLevel(gray, w, h) > MOTION_MAX) return { ok: false, hint: 'Hold the ID steady. Your photo may turn out blurry.' };
                if (lapVariance(gray, w, h, rect.x0 + 4, rect.y0 + 4, rect.x1 - 4, rect.y1 - 4) < BLUR_MIN_ID) {
                    return { ok: false, hint: 'ID is blurry. Hold steady, move slightly back or forward until the text is sharp.' };
                }
                return { ok: true, hint: 'ID is clear. Hold steady, capturing automatically...' };
            }

            return { analyzeFace, analyzeId, idGuideRect, resetMotion };
        })();

        function createWatcher(getVideo, analyze, onResult, intervalMs) {
            let timer = null, running = false, okStreak = 0, busy = false, stopped = false;
            const tick = async () => {
                if (busy || stopped) return;
                busy = true;
                try {
                    const res = await analyze(getVideo());
                    if (stopped) return;
                    okStreak = res.ok ? okStreak + 1 : 0;
                    onResult(res, okStreak >= 3);
                } catch (e) {
                    onResult({ ok: false, hint: 'Camera check failed. Please retry.' }, false);
                } finally {
                    busy = false;
                }
            };
            return {
                start() { if (running) return; running = true; stopped = false; okStreak = 0; timer = setInterval(tick, intervalMs || 300); },
                stop() { running = false; stopped = true; clearInterval(timer); timer = null; },
                isStable() { return okStreak >= 3; },
                streak() { return okStreak; }
            };
        }

        let suFaceWatcher = null;
        let idWatcher = null;
        let idAutoFired = false;
        let suAutoFired = false;

        function startSuFaceWatch() {
            stopSuFaceWatch();
            const video = document.getElementById('suSelfieVideo');
            const guide = document.getElementById('suFaceGuide');
            const instruction = document.getElementById('suSelfieInstruction');
            const actionBtn = document.getElementById('suSelfieActionBtn');
            guide.style.display = 'block';
            guide.className = 'face-guide';
            actionBtn.disabled = false;
            suAutoFired = false;
            CamGuard.resetMotion();
            suFaceWatcher = createWatcher(() => video, CamGuard.analyzeFace, (res, stable) => {
                instruction.textContent = res.hint;
                instruction.style.color = res.ok ? 'var(--success-green)' : '#666';
                guide.className = 'face-guide ' + (res.ok ? 'ok' : 'bad');
                if (res.ok && suFaceWatcher && suFaceWatcher.streak() >= 4 && !suAutoFired && !suSelfieCaptured) {
                    suAutoFired = true;
                    captureSuSelfie();
                }
            }, 300);
            suFaceWatcher.start();
        }

        function stopSuFaceWatch() {
            if (suFaceWatcher) { suFaceWatcher.stop(); suFaceWatcher = null; }
            const refreshBtn = document.getElementById('suRefreshBtn');
            if (refreshBtn) refreshBtn.style.display = 'none';
            const guide = document.getElementById('suFaceGuide');
            if (guide) guide.style.display = 'none';
        }

        function layoutIdGuide() {
            const video = document.getElementById('idCameraVideo');
            const guide = document.getElementById('idCameraGuide');
            if (!video.videoWidth) return;
            const r = CamGuard.idGuideRect(video);
            guide.style.left = r.left + 'px';
            guide.style.top = r.top + 'px';
            guide.style.width = r.width + 'px';
            guide.style.height = r.height + 'px';
        }

        function startIdWatch() {
            stopIdWatch();
            const video = document.getElementById('idCameraVideo');
            const guide = document.getElementById('idCameraGuide');
            const msg = document.getElementById('idCameraMsg');
            const shot = document.getElementById('idCameraShotBtn');
            layoutIdGuide();
            guide.style.display = 'block';
            shot.disabled = false;
            idAutoFired = false;
            CamGuard.resetMotion();
            idWatcher = createWatcher(() => video, CamGuard.analyzeId, (res, stable) => {
                layoutIdGuide();
                msg.textContent = res.hint;
                msg.style.color = res.ok ? 'var(--success-green)' : '';
                guide.className = 'id-cam-guide ' + (res.ok ? 'ok' : 'bad');
                if (res.ok && idWatcher && idWatcher.streak() >= 4 && !idAutoFired) {
                    idAutoFired = true;
                    captureIdPhoto();
                }
            }, 350);
            idWatcher.start();
        }

        function stopIdWatch() {
            if (idWatcher) { idWatcher.stop(); idWatcher = null; }
            const guide = document.getElementById('idCameraGuide');
            if (guide) guide.style.display = 'none';
        }

        let idCamStream = null;
        let idCamSide = 'front';
        async function openIdCamera(side) {
            idCamSide = side;
            document.getElementById('idCameraTitle').textContent = side === 'front' ? 'Take Photo — Front of ID' : 'Take Photo — Back of ID';
            const msg = document.getElementById('idCameraMsg');
            const shot = document.getElementById('idCameraShotBtn');
            msg.textContent = 'Opening camera...';
            shot.disabled = false;
            openModal('idCameraModal');
            try {
                try {
                    idCamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
                } catch (e1) {
                    idCamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }
                const idVideo = document.getElementById('idCameraVideo');
                idVideo.srcObject = idCamStream;
                msg.textContent = 'Place the whole ID inside the frame. Make sure all details are readable.';
                const begin = () => startIdWatch();
                if (idVideo.videoWidth) begin(); else idVideo.onloadedmetadata = begin;
            } catch (err) {
                msg.textContent = 'Camera unavailable. Please allow camera access in your browser, then try again.';
            }
        }
        function closeIdCamera() {
            stopIdWatch();
            if (idCamStream) { idCamStream.getTracks().forEach(t => t.stop()); idCamStream = null; }
            closeModal('idCameraModal');
        }
        function captureIdPhoto() {
            const video = document.getElementById('idCameraVideo');
            const canvas = document.getElementById('idCameraCanvas');
            if (!idCamStream || !video.videoWidth) { showAlertBox('Camera is not ready yet. Please wait a moment and try again.'); return; }
            const idCheck = CamGuard.analyzeId(video);
            if (!idCheck.ok) {
                document.getElementById('idCameraMsg').textContent = idCheck.hint;
                return;
            }
            const maxW = 1280, scale = Math.min(1, maxW / video.videoWidth);
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const front = idCamSide === 'front';
            if (front) suData.frontId = dataUrl; else suData.backId = dataUrl;
            const statusEl = document.getElementById(front ? 'suIdFrontStatus' : 'suIdBackStatus');
            statusEl.textContent = front ? '✓ Front ID Captured' : '✓ Back ID Captured';
            statusEl.style.color = 'var(--success-green)';
            const prev = document.getElementById(front ? 'suIdFrontPreview' : 'suIdBackPreview');
            prev.src = dataUrl; prev.style.display = 'block';
            closeIdCamera();
        }

        function validateSuStep4() {
            if (!suData.frontId || !suData.backId) {
                showAlertBox('Please capture or upload both the Front and Back of your ID before proceeding.');
                return;
            }
            goToSignupStep(5);
        }

        async function startSuSelfieCamera() {
            suSelfieCaptured = false;
            const video = document.getElementById('suSelfieVideo');
            const preview = document.getElementById('suSelfiePreview');
            const actionBtn = document.getElementById('suSelfieActionBtn');
            const retakeBtn = document.getElementById('suRetakeBtn');
            const instruction = document.getElementById('suSelfieInstruction');

            video.style.display = 'block';
            preview.style.display = 'none';
            actionBtn.textContent = 'Refresh';
            actionBtn.disabled = false;
            retakeBtn.style.display = 'none';
            instruction.style.color = '#666';
            instruction.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Opening camera...';

            try {
                suSelfieStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 }, aspectRatio: { ideal: 4 / 3 } }, audio: false });
                video.srcObject = suSelfieStream;
                instruction.textContent = 'Looking for your face...';
                const beginFace = () => startSuFaceWatch();
                if (video.videoWidth) beginFace(); else video.onloadedmetadata = beginFace;
            } catch (err) {
                console.warn('Front camera access unavailable:', err);
                instruction.textContent = 'Camera unavailable. A camera photo is required — please allow camera access and press Retake.';
            }
        }

        function stopSuSelfieCamera() {
            stopSuFaceWatch();
            if (suSelfieStream) {
                suSelfieStream.getTracks().forEach(track => track.stop());
                suSelfieStream = null;
            }
        }

        function suActionClick() {
            if (suSelfieCaptured) captureSuSelfie(); else refreshSuSelfieCamera();
        }
        function refreshIdCamera() {
            const side = idCamSide;
            closeIdCamera();
            setTimeout(() => openIdCamera(side), 250);
        }
        function captureSuSelfie() {
            if (!suSelfieCaptured) {
                if (!suSelfieStream) { showAlertBox('A camera photo is required. Please allow camera access, then press Retake / Capture Photo.'); return; }
                const video = document.getElementById('suSelfieVideo');
                const canvas = document.getElementById('suSelfieCanvas');
                const preview = document.getElementById('suSelfiePreview');
                const retakeBtn = document.getElementById('suRetakeBtn');
                const actionBtn = document.getElementById('suSelfieActionBtn');
                const instruction = document.getElementById('suSelfieInstruction');

                if (!suFaceWatcher || !suFaceWatcher.isStable()) {
                    showAlertBox('No clear face detected. Center your face inside the oval before capturing.');
                    return;
                }

                canvas.width = video.videoWidth || 300;
                canvas.height = video.videoHeight || 300;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/png');
                preview.src = dataUrl;
                suData.faceDoc = dataUrl;
                video.style.display = 'none';
                preview.style.display = 'block';

                stopSuSelfieCamera();

                suSelfieCaptured = true;
                instruction.textContent = 'Review your photo. Retake if blur.';
                actionBtn.textContent = 'Proceed';
                retakeBtn.style.display = 'block';
            } else {
                if (!suData.faceDoc) { showAlertBox('A camera photo is required to continue.'); return; }
                goToSignupStep(6);
            }
        }

        function retakeSuSelfie() {
            startSuSelfieCamera();
        }

        function refreshSuSelfieCamera() {
            stopSuSelfieCamera();
            setTimeout(() => startSuSelfieCamera(), 250);
        }

        const GMAIL_RE = /^[a-z0-9._%+\-]+@gmail\.com$/i;
        function suCheckEmailLive(showPopup) {
            const v = document.getElementById('suEmail').value.trim();
            const hint = document.getElementById('suEmailHint');
            if (!v) { hint.textContent = ''; hint.className = 'su-hint'; return false; }
            if (!GMAIL_RE.test(v)) {
                hint.className = 'su-hint bad';
                hint.textContent = 'A valid Gmail address is required (it must end with @gmail.com).';
                if (showPopup) showAlertBox('Please enter a valid Gmail address — it must contain "@gmail.com".');
                return false;
            }
            hint.className = 'su-hint good'; hint.textContent = '✓ Valid Gmail address.';
            return true;
        }
        let suEmailTakenCache = {};
        function suEmailIsTaken(email) {
            const e = String(email).trim().toLowerCase();
            if (Object.prototype.hasOwnProperty.call(suEmailTakenCache, e)) return Promise.resolve(suEmailTakenCache[e]);
            return apiRequest('/email-available?email=' + encodeURIComponent(e)).then(r => {
                suEmailTakenCache[e] = !r.available;
                return suEmailTakenCache[e];
            }).catch(() => false);
        }
        function suWarnEmailTaken() {
            const hint = document.getElementById('suEmailHint');
            if (hint) { hint.className = 'su-hint bad'; hint.textContent = 'This Gmail is already registered. Please use a different one.'; }
            showAlertBox('This Gmail address is already registered. Please use a different Gmail.');
            document.getElementById('suEmail').focus();
        }
        function suGuardPasswordFocus(el) {
            if (!suCheckEmailLive(false)) {
                el.blur();
                showAlertBox('Please enter a valid Gmail address (ending in "@gmail.com") before creating your password.');
                document.getElementById('suEmail').focus();
                return;
            }
            const email = document.getElementById('suEmail').value.trim().toLowerCase();
            suEmailIsTaken(email).then(taken => {
                if (taken && document.getElementById('suEmail').value.trim().toLowerCase() === email) { el.blur(); suWarnEmailTaken(); }
            });
        }
        function validateSuStep6() {
            const email = document.getElementById('suEmail').value.trim().toLowerCase();
            const p1 = document.getElementById('suPassword').value;
            const p2 = document.getElementById('suConfirmPassword').value;

            if (!email || !p1 || !p2) {
                showAlertBox('Please complete all fields.');
                return;
            }
            if (!GMAIL_RE.test(email)) {
                showAlertBox('Please enter a valid Gmail address — it must contain "@gmail.com".');
                return;
            }

            const exists = systemUsers.find(u => u.email.toLowerCase() === email);
            if (exists) {
                showAlertBox('This email already has a registered account.');
                return;
            }
            if (!Object.prototype.hasOwnProperty.call(suEmailTakenCache, email)) {
                suEmailIsTaken(email).then(() => validateSuStep6());
                return;
            }
            if (suEmailTakenCache[email]) { suWarnEmailTaken(); return; }

            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(p1)) {
                showAlertBox('Password must be at least 8 characters long and contain both numbers and symbols.');
                return;
            }
            if (p1 !== p2) {
                showAlertBox('Passwords do not match!');
                return;
            }

            suData.email = email;
            suData.password = p1;

            document.getElementById('suSummaryFullname').value = suData.fullname || '';
            document.getElementById('suSummaryUsername').value = suData.username || '';
            document.getElementById('suSummaryContact').value = suData.contact || '';
            document.getElementById('suSummaryGender').value = suData.gender || '';
            document.getElementById('suSummaryRole').value = suData.role || 'Staff';
            document.getElementById('suSummaryDob').value = suData.dob || '';
            document.getElementById('suSummaryBrgy').value = suData.brgy || '';
            document.getElementById('suSummaryEmail').value = suData.email || '';
            document.getElementById('suSummaryAvatar').src = suData.faceDoc || PICTURE_FALLBACK;

            goToSignupStep(7);
        }

        function confirmSuSignup() {
            const fullname = document.getElementById('suSummaryFullname').value.trim();
            const contact = document.getElementById('suSummaryContact').value.trim();
            const gender = document.getElementById('suSummaryGender').value.trim();
            const dob = document.getElementById('suSummaryDob').value.trim();
            const brgy = document.getElementById('suSummaryBrgy').value.trim();
            const email = document.getElementById('suSummaryEmail').value.trim().toLowerCase();

            if (!fullname || !contact || !email || !brgy || !suData.username) {
                showAlertBox(REQUIRED_MSG);
                return;
            }
            if (!suData.frontId || !suData.backId || !suData.faceDoc) {
                showAlertBox('Please complete the ID and camera photos before submitting.');
                return;
            }
            const finalBErr = birthdateError(dob, 'staff');
            if (finalBErr) { showAlertBox(finalBErr); return; }
            if (!GMAIL_RE.test(email)) { showAlertBox('Please enter a valid Gmail address — it must contain "@gmail.com".'); return; }

            const submitBtn = document.getElementById('suSubmitApprovalBtn');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Submitting...'; }

            apiRequest('/register', 'POST', {
                name: fullname,
                username: suData.username,
                email: email,
                password: suData.password,
                contact: contact,
                brgy: brgy,
                gender: gender,
                dob: dob,
                role: suData.role || 'Staff',
                idFront: suData.frontId,
                idBack: suData.backId,
                faceDoc: suData.faceDoc,
            }).then(data => {
                if (data && data.user) {
                    systemUsers.push(data.user);
                    localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                }
                goToSignupStep(8);
            }).catch(err => {
                showAlertBox(err.message || 'Could not submit your sign-up request. Please check your connection and try again.');
            }).finally(() => {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Submit'; }
            });
        }

        function renderStaffApprovalList() {
            const listContainer = document.getElementById('pendingStaffList');
            if(!listContainer) return;
            
            const pendingStaff = systemUsers.filter(u => u.role !== 'Admin' && u.status === 'Pending');
            
            if(pendingStaff.length === 0) {
                listContainer.innerHTML = '<div style="text-align:center; padding:15px; color:var(--text-muted);">No pending staff approvals at this time.</div>';
                return;
            }

            listContainer.innerHTML = pendingStaff.map(staff => `
                <div style="background:var(--card-bg); border:1px solid var(--border-color); padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:bold; color:var(--text-dark);">${esc(staff.name)}</div>
                        <div style="font-size:12px; color:var(--text-muted);">${esc(staff.email)} | ${esc(staff.contact)}</div>
                        <div style="font-size:11px; color:var(--primary-red); font-weight:bold;">Barangay: ${esc(staff.brgy)}</div>
                    </div>
                    <div>
                        <button onclick="approveStaff('${esc(staff.id)}')" style="background:var(--success-green); color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; margin-right:5px;"><i class="fa-solid fa-check"></i> Approve</button>
                        <button onclick="rejectStaff('${esc(staff.id)}')" style="background:var(--primary-red); color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;"><i class="fa-solid fa-xmark"></i> Reject</button>
                    </div>
                </div>
            `).join('');
        }

        function approveStaff(staffId, event) {
            const idx = systemUsers.findIndex(u => u.id === staffId);
            if(idx !== -1) {
                const staffName = systemUsers[idx].name;
                const btn = event ? event.currentTarget : null;
                const btnOriginal = btn ? btn.innerHTML : '';
                if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Approving...'; }

                apiRequest('/admin/staff/' + staffId + '/approve', 'PATCH').then(data => {
                    if (data && data.user) {
                        const freshIdx = systemUsers.findIndex(u => u.id === staffId);
                        if (freshIdx !== -1) systemUsers[freshIdx] = data.user;
                        localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                    }
                    showAlertBox(`${staffName} has been approved as Staff! They can now log in.`);
                    renderUsersLogView();
                    renderAdminApprovalPageView();
                    renderStaffApprovalList();
                    updateStatisticsData();
                }).catch(err => {
                    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = btnOriginal; }
                    showAlertBox(err.message || 'Error: Could not approve this staff account. Please try again.');
                });
            }
        }

        function rejectStaff(staffId, event) {
            const btn = event ? event.currentTarget : null;
            const btnOriginal = btn ? btn.innerHTML : '';
            showConfirmBox('Are you sure you want to reject this staff sign-up request?', () => {
                if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Rejecting...'; }
                apiRequest('/admin/staff/' + staffId + '/reject', 'DELETE').then(() => {
                    systemUsers = systemUsers.filter(u => u.id !== staffId);
                    localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                    showAlertBox('The staff sign-up request has been rejected.');
                    renderUsersLogView();
                    renderAdminApprovalPageView();
                    renderStaffApprovalList();
                    updateStatisticsData();
                }).catch(err => {
                    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = btnOriginal; }
                    showAlertBox(err.message || 'Error: Could not reject this staff account. Please try again.');
                });
            }, 'Reject Staff Sign-up');
        }

        let isSidebarOpen = window.innerWidth > 768;

        function applySidebarState() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');
            if (!sidebar) return;
            sidebar.style.transform = '';
            if (isSidebarOpen) {
                sidebar.classList.add('open');
                sidebar.classList.remove('closed');
                if (mainContent) mainContent.classList.remove('expanded');
            } else {
                sidebar.classList.remove('open');
                sidebar.classList.add('closed');
                if (mainContent) mainContent.classList.add('expanded');
            }
        }

        function toggleSidebar() {
            isSidebarOpen = !isSidebarOpen;
            applySidebarState();
        }

        (function setupSidebarSwipeGesture() {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;
            const sidebarWidth = 280;
            let touchStartX = 0;
            let touchCurrentX = 0;
            let isDraggingSidebar = false;

            sidebar.addEventListener('touchstart', (e) => {
                if (!isSidebarOpen) return;
                touchStartX = e.touches[0].clientX;
                touchCurrentX = touchStartX;
                isDraggingSidebar = true;
                sidebar.style.transition = 'none';
            }, { passive: true });

            sidebar.addEventListener('touchmove', (e) => {
                if (!isDraggingSidebar) return;
                touchCurrentX = e.touches[0].clientX;
                const deltaX = touchCurrentX - touchStartX;
                if (deltaX < 0) {
                    sidebar.style.transform = `translateX(${deltaX}px)`;
                }
            }, { passive: true });

            sidebar.addEventListener('touchend', () => {
                if (!isDraggingSidebar) return;
                isDraggingSidebar = false;
                sidebar.style.transition = '';
                const deltaX = touchCurrentX - touchStartX;
                touchStartX = 0;
                touchCurrentX = 0;
                if (deltaX < -(sidebarWidth * 0.3)) {
                    isSidebarOpen = false;
                }
                applySidebarState();
            });
        })();

        function applyDarkModeIcon() {
            const on = document.body.classList.contains('dark-mode');
            document.querySelectorAll('.dark-mode-toggle-btn').forEach(btn => {
                btn.classList.toggle('on', on);
                const st = btn.querySelector('.dm-state');
                if (st) st.textContent = on ? 'ON' : 'OFF';
                const icon = btn.querySelector('.dm-icon');
                if (icon) icon.className = 'fa-solid ' + (on ? 'fa-sun' : 'fa-moon') + ' dm-icon';
            });
        }

        function toggleDarkMode() {
            const on = document.body.classList.toggle('dark-mode');
            try { localStorage.setItem('redflow_dark_mode', on ? '1' : '0'); } catch (e) {}
            applyDarkModeIcon();
        }

        (function initDarkMode() {
            try {
                if (localStorage.getItem('redflow_dark_mode') === '1') {
                    document.body.classList.add('dark-mode');
                }
            } catch (e) {}
        })();

        function toggleDropdown(id) {
            const drop = document.getElementById(id);
            drop.style.display = (drop.style.display === 'block') ? 'none' : 'block';
        }

        function switchMainPage(pageName, navBtnElement) {
            const pages = document.querySelectorAll('.page-view');
            pages.forEach(p => p.classList.remove('active'));

            const target = document.getElementById(`page-${pageName}`);
            if (target) target.classList.add('active');

            const NAV_ALIAS = { 'create-history-form': 'home', 'single-record': 'history' };
            const navPage = pageName in NAV_ALIAS ? NAV_ALIAS[pageName] : pageName;
            document.querySelectorAll('.side-custom-btn').forEach(n => n.classList.toggle('active', !!n.dataset.page && n.dataset.page === navPage));
            document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.toggle('active', !!n.dataset.page && n.dataset.page === navPage));

            if (window.innerWidth <= 768 && isSidebarOpen) {
                isSidebarOpen = false;
                applySidebarState();
            }
        }

        function loadPolicyTab(tab) {
            const valid = ['privacy', 'terms', 'legal', 'about'];
            const active = valid.includes(tab) ? tab : 'privacy';
            document.querySelectorAll('.about-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.ptab === active));
            document.querySelectorAll('#aboutSubPanel .about-section').forEach(sec => {
                sec.style.display = sec.dataset.policy === active ? '' : 'none';
            });
        }
        function loadSubModule(moduleName) {
            loadPolicyTab(moduleName === 'about' ? 'about' : 'privacy');
        }

        function toggleFaqItem(buttonEl) {
            const item = buttonEl.closest('.faq-item');
            if (item) item.classList.toggle('open');
        }

        function handleProfileImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const label = document.querySelector('.profile-photo-change-text');
                const labelOriginal = label ? label.innerHTML : '';
                if (label) label.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profileAvatarImg').src = e.target.result;
                    if (isViewingStaff) {
                        document.getElementById('headerAvatarImg').src = e.target.result;
                        staffData.avatar = e.target.result;
                        localStorage.setItem('redflow_staff_profile', JSON.stringify(staffData));
                        const meNow = safeParseJSON('redflow_current_user');
                        if (meNow) { try { localStorage.setItem('redflow_avatar_' + meNow.id, e.target.result); } catch (err) {} }
                    }
                    if (label) label.innerHTML = labelOriginal;
                    showAlertBox('Profile photo updated successfully!');
                };
                reader.onerror = function() {
                    if (label) label.innerHTML = labelOriginal;
                    showAlertBox('Error: That photo could not be uploaded. Please try a different file.');
                };
                reader.readAsDataURL(file);
            }
        }
function handleWizardAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const label = document.getElementById('wizardAvatarUploadLabel');
                const labelOriginal = label ? label.innerHTML : '';
                if (label) label.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('wizardAvatarPreview').src = e.target.result;
                    wizardAvatarSrc = e.target.result;
                    renderWizardAvatarPicker();
                    if (label) label.innerHTML = labelOriginal;
                };
                reader.onerror = function() {
                    if (label) label.innerHTML = labelOriginal;
                    showAlertBox('Error: That photo could not be uploaded. Please try a different file.');
                };
                reader.readAsDataURL(file);
            }
        }

        function handleSuAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const label = document.getElementById('suAvatarUploadLabel');
                const labelOriginal = label ? label.innerHTML : '';
                if (label) label.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('suSummaryAvatar').src = e.target.result;
                    suData.faceDoc = e.target.result;
                    if (label) label.innerHTML = labelOriginal;
                };
                reader.onerror = function() {
                    if (label) label.innerHTML = labelOriginal;
                    showAlertBox('Error: That photo could not be uploaded. Please try a different file.');
                };
                reader.readAsDataURL(file);
            }
        }

        const EYE_ICON_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        const EYE_SLASH_ICON_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.6 21.6 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.6 21.6 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

        function togglePasswordVisibility(fieldId, buttonElement) {
            const inputField = document.getElementById(fieldId);
            if (inputField.type === 'password') {
                inputField.type = 'text';
                buttonElement.innerHTML = EYE_SLASH_ICON_SVG;
            } else {
                inputField.type = 'password';
                buttonElement.innerHTML = EYE_ICON_SVG;
            }
        }

        function confirmLogout() {
            closeModal('logoutModal');
            wipeLocalAppData();
            document.getElementById('mainAppContainer').style.display = 'none';
            document.getElementById('loginView').classList.remove('hidden');
            apiRequest('/logout', 'POST').catch(() => {});
        }

        let cpTargetEmail = '';
        let cpVerifiedCode = '';

        function goToCpStep(stepNumber) {
            document.querySelectorAll('#page-settings .cp-step').forEach(panel => panel.classList.remove('active'));
            const target = document.getElementById('cp-step-' + stepNumber);
            if (target) target.classList.add('active');
        }

        function resetChangePasswordFlow() {
            cpTargetEmail = '';
            cpVerifiedCode = '';
            ['currentPassInput', 'newPassInput', 'confirmPassInput'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.value = ''; el.type = 'password'; }
            });
            document.querySelectorAll('.cp-otp').forEach(input => input.value = '');
            const currentUser = safeParseJSON('redflow_current_user');
            const emailInput = document.getElementById('cpEmailInput');
            if (emailInput) emailInput.value = '';
            const sendBtn = document.getElementById('cpSendCodeBtn');
            if (sendBtn) { sendBtn.textContent = 'Send Code'; sendBtn.disabled = false; sendBtn.style.opacity = '1'; }
            goToCpStep(1);
        }

        function cpSendCode() {
            const email = document.getElementById('cpEmailInput').value.trim().toLowerCase();
            if (!email) {
                showAlertBox('Error: Please enter your email address.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showAlertBox('Error: Please enter a valid email address.');
                return;
            }
            if (!navigator.onLine) {
                showAlertBox(FP_EMAIL_FAIL_MSG);
                return;
            }

            const btn = document.getElementById('cpSendCodeBtn');
            btn.textContent = 'Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.6';

            apiRequest('/change-password/send-otp', 'POST', { email: email }).then(() => {
                cpTargetEmail = email;
                document.getElementById('cpEmailTargetText').textContent = `Check ${email} for your 6-digit code.`;
                document.querySelectorAll('.cp-otp').forEach(input => input.value = '');
                goToCpStep(2);
                const first = document.querySelector('.cp-otp');
                if (first) first.focus();
            }).catch(err => {
                showAlertBox(err.isNetworkError ? FP_EMAIL_FAIL_MSG : (err.message || FP_EMAIL_FAIL_MSG));
            }).finally(() => {
                btn.textContent = 'Send Code';
                btn.disabled = false;
                btn.style.opacity = '1';
            });
        }

        function cpResendCode(btn) {
            resendOtpWithFeedback(btn, '/change-password/send-otp', cpTargetEmail,
                `A new verification code has been sent to ${cpTargetEmail}.`,
                () => goToCpStep(1));
        }

        function cpVerifyCode(event) {
            let enteredCode = '';
            document.querySelectorAll('.cp-otp').forEach(input => { enteredCode += input.value.trim(); });
            if (enteredCode.length < 6) {
                showAlertBox('Please enter the complete 6-digit verification code.');
                return;
            }
            const btn = event ? event.currentTarget : document.querySelector('#cp-step-2 .action-main-btn');
            const btnOriginal = btn ? btn.innerHTML : '';
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...'; }

            apiRequest('/change-password/verify-otp', 'POST', { email: cpTargetEmail, code: enteredCode }).then(() => {
                cpVerifiedCode = enteredCode;
                const shownEmail = document.getElementById('cpEmailShown');
                shownEmail.value = cpTargetEmail;
                shownEmail.removeAttribute('readonly');
                shownEmail.readOnly = false;
                shownEmail.disabled = false;
                goToCpStep(3);
            }).catch(err => {
                showAlertBox(err.message || 'Error: Invalid verification code. Please try again.');
            }).finally(() => {
                if (btn) { btn.disabled = false; btn.innerHTML = btnOriginal; }
            });
        }

        function validateAndChangePassword() {
            const currentPass = document.getElementById('currentPassInput').value;
            const newPass = document.getElementById('newPassInput').value;
            const confirmPass = document.getElementById('confirmPassInput').value;

            if (!cpTargetEmail || !cpVerifiedCode) {
                showAlertBox('Error: Please verify your email address with the 6-digit code first.');
                goToCpStep(1);
                return;
            }
            const emailFieldValue = document.getElementById('cpEmailShown').value.trim().toLowerCase();
            if (!emailFieldValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFieldValue)) {
                showAlertBox('Error: Please enter a valid email address.');
                return;
            }
            if (!currentPass) {
                showAlertBox('Error: Please enter your current password.');
                return;
            }

            const currentUser = safeParseJSON('redflow_current_user');
            if (!currentUser) {
                showAlertBox('Error: No logged in account found.');
                return;
            }

            const hasLength = newPass.length >= 8;
            const hasNumber = /[0-9]/.test(newPass);
            const hasSymbol = /[^A-Za-z0-9]/.test(newPass);
            if (!hasLength || !hasNumber || !hasSymbol) {
                showAlertBox('Error: Password must be at least 8 characters with numbers & symbols.');
                return;
            }
            if (newPass !== confirmPass) {
                showAlertBox('Error: New Password and Confirm New Password do not match.');
                return;
            }
            if (newPass === currentPass) {
                showAlertBox('Error: New Password must be different from your Current Password.');
                return;
            }

            const submitBtn = document.querySelector('#cp-step-3 button[type="submit"]');
            const submitBtnOriginal = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating Password...';
            }

            const payload = {
                email: cpTargetEmail,
                code: cpVerifiedCode,
                current_password: currentPass,
                password: newPass
            };
            const emailChanged = emailFieldValue !== cpTargetEmail;
            if (emailChanged) payload.new_email = emailFieldValue;

            apiRequest('/change-password', 'POST', payload).then(() => {
                refreshNotificationsFromServer();
                if (emailChanged) {
                    const cu = safeParseJSON('redflow_current_user');
                    if (cu) {
                        cu.email = emailFieldValue;
                        localStorage.setItem('redflow_current_user', JSON.stringify(cu));
                        const idx = systemUsers.findIndex(u => u.id === cu.id);
                        if (idx !== -1) {
                            systemUsers[idx].email = emailFieldValue;
                            localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                        }
                    }
                }
                showAlertBox(emailChanged ? 'Password and email address updated successfully!' : 'Password updated successfully!');
                resetChangePasswordFlow();
                refreshAuditLogFromServer();
            }).catch(err => {
                showAlertBox(err.isNetworkError ? 'Error: No internet connection. Please check your connection and try again.' : (err.message || 'Error: Current Password is incorrect.'));
            }).finally(() => {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; submitBtn.innerHTML = submitBtnOriginal; }
            });
        }

        function chooseDonorProfileAvatar(file) {
            const src = AVATAR_DIR + file;
            const img = document.getElementById('profileAvatarImg'); if (img) img.src = src;
            document.querySelectorAll('#donorAvatarPicker .avatar-choice').forEach(b => {
                const i = b.querySelector('img');
                b.classList.toggle('selected', !!i && i.getAttribute('src') === src);
            });
        }

        function openStaffProfile() {
            isViewingStaff = true;
            const currentUser = safeParseJSON('redflow_current_user') || staffData;
            if (currentUser && currentUser.id) { staffData = syncStaffDataFromUser(currentUser); }
            const container = document.getElementById('profile-container-box');
            container.innerHTML = `
                <div class="profile-back-row"><button type="button" class="profile-back-btn" onclick="switchMainPage('home', document.querySelector('.bottom-nav-item'))"><i class="fa-solid fa-arrow-left"></i> Back</button></div>
                <h2>ACCOUNT INFORMATION</h2>
                
                <input type="file" id="profileImageFile" accept="image/*" style="display: none;" onchange="handleProfileImageUpload(event)">
                
                <div class="profile-avatar-large" onclick="document.getElementById('profileImageFile').click()" title="Click to change photo">
                    <img id="profileAvatarImg" src="${esc(getUserAvatar(currentUser))}" alt="Profile" onerror="this.onerror=null;this.src='${defaultAvatarForSex(staffData.sex)}'">
                </div>
                <div class="profile-photo-change-text" onclick="document.getElementById('profileImageFile').click()">
                    <i class="fa-solid fa-camera"></i> Click to change photo
                </div>
                
                <form onsubmit="event.preventDefault();">
                    <div class="form-group-custom">
                        <label>FULL NAME</label>
                        <input type="text" id="staff_name" value="${esc(currentUser.name || staffData.name)}" required disabled>
                    </div>
                    <div class="form-group-custom">
                        <label>USERNAME</label>
                        <input type="text" id="staff_username" value="${esc(currentUser.username || '')}" maxlength="30" placeholder="username" disabled oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9._]/g,'')">
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>ROLE</label>
                            <input type="text" id="staff_role" value="${esc(currentUser.role || staffData.role)}" readonly disabled>
                        </div>
                        <div class="form-group-custom">
                            <label>SEX</label>
                            <select id="staff_sex" disabled>
                                <option value="Male" ${staffData.sex === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${staffData.sex === 'Female' ? 'selected' : ''}>Female</option>
                                <option value="Other" ${staffData.sex === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group-custom">
                        <label>BIRTHDAY</label>
                        <input type="date" id="staff_bday" value="${esc(staffData.bday)}" max="${maxAdultBirthdateISO()}" required disabled>
                    </div>
                    <div class="form-group-custom">
                        <label>BARANGAY / ADDRESS</label>
                        <input type="text" id="staff_address" value="${esc(staffData.address)}" required disabled>
                    </div>
                    <div class="form-group-custom">
                        <label>CONTACT NUMBER</label>
                        ${phoneFieldHtml('staff_contact', staffData.contact || currentUser.contact || '', true)}
                    </div>

                    <div id="staffProfileViewButtons">
                        <button type="button" onclick="enterStaffProfileEditMode()" style="width: 100%; padding: 14px; background-color: #222; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 15px;"><i class="fa-solid fa-pen"></i> Edit</button>
                    </div>
                    <div id="staffProfileEditButtons" style="display:none; gap:12px; margin-top:15px;">
                        <button type="button" onclick="cancelStaffProfileEditMode()" style="flex:1; padding: 14px; background-color: var(--primary-red); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">Cancel</button>
                        <button type="button" id="staffProfileUpdateBtn" onclick="updateStaffProfileData()" style="flex:1; padding: 14px; background-color: var(--success-green); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">Update</button>
                    </div>
                </form>
            `;
            switchMainPage('profile', null);
        }

        function enterStaffProfileEditMode() {
            ['staff_name','staff_username','staff_sex','staff_bday','staff_address','staff_contact'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
            });
            const vb = document.getElementById('staffProfileViewButtons');
            const eb = document.getElementById('staffProfileEditButtons');
            if (vb) vb.style.display = 'none';
            if (eb) eb.style.display = 'flex';
        }

        function cancelStaffProfileEditMode() {
            openStaffProfile();
        }

        function updateStaffProfileData() {
            const name = document.getElementById('staff_name').value.trim();
            const sex = document.getElementById('staff_sex').value;
            const bday = document.getElementById('staff_bday').value;
            const address = document.getElementById('staff_address').value.trim();
            const contact = phoneFull('staff_contact');
            const username = (document.getElementById('staff_username').value || '').trim().toLowerCase();

            if (!name || !username || !bday || !document.getElementById('staff_contact').value.trim()) {
                showAlertBox(REQUIRED_MSG);
                return;
            }
            if (!/^[a-z0-9._]{4,30}$/.test(username)) {
                showAlertBox('Username must be 4–30 characters: letters, numbers, dot (.) or underscore (_).');
                return;
            }
            const sbErr = birthdateError(bday, 'you');
            if (sbErr) { showAlertBox(sbErr); return; }
            if (!isValidPh10('staff_contact')) {
                showAlertBox('Please enter your complete contact number after +63.');
                return;
            }

            const btn = document.getElementById('staffProfileUpdateBtn');
            const btnOriginalHtml = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
            }

            apiRequest('/api/profile', 'PUT', { name: name, username: username, sex: sex, bday: bday || null, address: address, contact: contact }).then(() => {
                staffData.name = name;
                staffData.sex = sex;
                staffData.bday = bday;
                staffData.address = address;
                staffData.contact = contact;
                localStorage.setItem('redflow_staff_profile', JSON.stringify(staffData));

                const currentUser = safeParseJSON('redflow_current_user');
                if (currentUser) {
                    currentUser.name = staffData.name;
                    currentUser.username = username;
                    currentUser.gender = sex;
                    currentUser.dob = bday;
                    currentUser.brgy = address;
                    currentUser.contact = staffData.contact;
                    localStorage.setItem('redflow_current_user', JSON.stringify(currentUser));
                    refreshHeaderAvatar();
                    const userIdx = systemUsers.findIndex(u => u.id === currentUser.id);
                    if (userIdx !== -1) {
                        systemUsers[userIdx].name = staffData.name;
                        systemUsers[userIdx].username = username;
                        systemUsers[userIdx].contact = staffData.contact;
                        localStorage.setItem('redflow_system_users', JSON.stringify(systemUsers));
                    }
                }
                showAlertBox('Profile updated successfully!');
                openStaffProfile();
            }).catch(err => {
                showAlertBox(err.message || 'Error: Could not update your profile. Please try again.');
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = btnOriginalHtml; }
            });
        }

        const AUDIT_LOG_MAX_ENTRIES = 500;
        function getCurrentUserForAudit() {
            const cu = safeParseJSON('redflow_current_user');
            return cu || { id: 'unknown', name: 'Unknown User', role: 'Unknown' };
        }
        function formatChangeParts(parts) {
            return parts.length ? 'Updated Information:\nChange: ' + parts.join('\nChange: ') : '';
        }
        function logAuditEvent(action, donor, details) {
            if (!donor) return;
            const actingUser = getCurrentUserForAudit();
            const auditLog = safeParseJSON('redflow_audit_log') || [];
            auditLog.unshift({
                id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                timestamp: new Date().toISOString(),
                userId: actingUser.id,
                userName: actingUser.name,
                userRole: actingUser.role,
                action: action,
                donorId: donor.id,
                donorName: donor.name,
                details: details || ''
            });
            if (auditLog.length > AUDIT_LOG_MAX_ENTRIES) auditLog.length = AUDIT_LOG_MAX_ENTRIES;
            localStorage.setItem('redflow_audit_log', JSON.stringify(auditLog));
        }

        let selectedAuditLogIds = new Set();
        let currentRenderedAuditLogIds = [];

        function auditActionBadgeColor(action) {
            if (action === 'Update') return { bg: '#ffc107', fg: '#222' };
            if (action === 'Create') return { bg: 'var(--success-green)', fg: '#fff' };
            if (action === 'Change') return { bg: 'var(--primary-red)', fg: '#fff' };
            if (action === 'Export') return { bg: '#6f42c1', fg: '#fff' };
            if (action === 'Delete') return { bg: '#1976d2', fg: '#fff' };
            return { bg: '#1976d2', fg: '#fff' };
        }

        function refreshAuditLogFromServer() {
            apiRequest('/api/audit-log').then(data => {
                if (data && data.entries) {
                    localStorage.setItem('redflow_audit_log', JSON.stringify(data.entries));
                    renderAuditLogView();
                }
            }).catch(() => {  });
        }

        let auditFilter = 'all';
        const AUDIT_GROUPS = [['Create', 'Create', 'fa-plus'], ['Update', 'Update', 'fa-pen'], ['Delete', 'Delete', 'fa-trash'], ['Export', 'Export', 'fa-file-export'], ['Other', 'Others', 'fa-clipboard-list']];
        function auditGroupOf(entry) {
            return ['Create', 'Update', 'Delete', 'Export'].includes(entry.action) ? entry.action : 'Other';
        }
        function setAuditFilter(f) { auditFilter = f; renderAuditLogView(); }

        // ---- Audit Log search / filter ----
        function auditLocalDateKey(iso) {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
        function auditSearchText(entry, field) {
            const d = new Date(entry.timestamp);
            const validDate = !isNaN(d.getTime());
            const dateText = validDate ? [
                d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                d.toLocaleDateString('en-US', { weekday: 'long' }),
                d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                auditLocalDateKey(entry.timestamp),
                d.toLocaleDateString('en-US')
            ].join(' ') : '';
            const parts = {
                staff: [entry.userName, entry.userRole, entry.userId],
                donor: [entry.donorName, entry.donorId],
                action: [entry.action],
                changes: [entry.details],
                date: [dateText]
            };
            const keys = field && field !== 'all' ? [field] : Object.keys(parts);
            return keys.map(k => (parts[k] || []).join(' ')).join(' ').toLowerCase();
        }
        function auditEntryMatches(entry) {
            const field = (document.getElementById('auditSearchField') || {}).value || 'all';
            const q = ((document.getElementById('auditSearchInput') || {}).value || '').trim().toLowerCase();
            const from = (document.getElementById('auditDateFrom') || {}).value || '';
            const to = (document.getElementById('auditDateTo') || {}).value || '';
            if (from || to) {
                const key = auditLocalDateKey(entry.timestamp);
                if (!key) return false;
                if (from && key < from) return false;
                if (to && key > to) return false;
            }
            if (!q) return true;
            const hay = auditSearchText(entry, field);
            return q.split(/\s+/).every(term => hay.includes(term));
        }
        function auditFiltersActive() {
            return !!(((document.getElementById('auditSearchInput') || {}).value || '').trim()
                || (document.getElementById('auditDateFrom') || {}).value
                || (document.getElementById('auditDateTo') || {}).value);
        }
        function clearAuditSearch() {
            ['auditSearchInput', 'auditDateFrom', 'auditDateTo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            const f = document.getElementById('auditSearchField'); if (f) f.value = 'all';
            auditFilter = 'all';
            renderAuditLogView();
        }
        const debouncedRenderAuditLog = debounce(renderAuditLogView, 200);
        function auditByLabel(action) {
            const m = { Create: 'Created by', Update: 'Updated by', Delete: 'Deleted by', Export: 'Exported by', Change: 'Changed by' };
            return m[action] || 'Done by';
        }
        function auditEntryHtml(entry) {
            const badge = auditActionBadgeColor(entry.action);
            return `
                <div style="background:var(--bg-light); border:1px solid var(--border-color); border-radius:8px; padding:12px 15px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:flex-start; gap:10px; min-width:0; flex:1;">
                        <input type="checkbox" class="admin-row-checkbox" style="margin-top:4px;" ${selectedAuditLogIds.has(String(entry.id)) ? 'checked' : ''} onchange="toggleAuditLogSelect('${esc(entry.id)}', this.checked)">
                        <div style="min-width:0;">
                            <div style="font-weight:bold; color:var(--text-dark); font-size:14px;">${esc(entry.action)} — ${esc(entry.donorName || entry.userName)}</div>
                            <div style="font-size:12px; color:var(--text-muted);">${auditByLabel(entry.action)}: ${esc(entry.userName)} (${esc(entry.userRole)}) &middot; ${formatLoginTimestamp(entry.timestamp)}</div>
                            ${entry.details ? `<div style="font-size:12.5px; color:var(--text-dark); margin-top:6px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:6px; padding:8px 10px; white-space:pre-line; line-height:1.5;">${esc(String(entry.details).replace(/\n\s*\n+/g, '\n').trim())}</div>` : ''}
                        </div>
                    </div>
                    <span style="font-size:11px; font-weight:bold; padding:4px 10px; border-radius:12px; background:${badge.bg}; color:${badge.fg};">${esc(entry.action)}</span>
                </div>`;
        }
        function renderAuditLogView() {
            const container = document.getElementById('auditLogContainer');
            if (!container) return;
            const allEntries = safeParseJSON('redflow_audit_log') || [];
            const auditLog = allEntries.filter(auditEntryMatches);
            const groups = {};
            AUDIT_GROUPS.forEach(g => groups[g[0]] = []);
            auditLog.forEach(e => groups[auditGroupOf(e)].push(e));
            const countEl = document.getElementById('auditResultCount');
            if (countEl) countEl.textContent = auditFiltersActive() ? `Showing ${auditLog.length} of ${allEntries.length} records` : `${allEntries.length} records`;
            const clearBtn = document.getElementById('auditClearSearchBtn');
            if (clearBtn) clearBtn.style.display = auditFiltersActive() ? '' : 'none';

            const visible = auditFilter === 'all' ? auditLog : groups[auditFilter] || [];
            currentRenderedAuditLogIds = visible.map(entry => String(entry.id));
            selectedAuditLogIds.clear();
            refreshAuditLogDeleteBtn();
            const bulkBar = document.getElementById('auditLogBulkBar');
            if (bulkBar) bulkBar.style.display = 'flex';
            const selectAllBox = document.getElementById('auditLogSelectAll');
            if (selectAllBox) selectAllBox.checked = false;

            if (allEntries.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No sensitive data access has been logged yet.</p>';
                return;
            }
            if (auditLog.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No audit records match your search.</p>';
                return;
            }
            const chips = `<div class="notif-chips"><button class="notif-chip ${auditFilter === 'all' ? 'active' : ''}" onclick="setAuditFilter('all')">All (${auditLog.length})</button>` +
                AUDIT_GROUPS.filter(g => groups[g[0]].length > 0).map(g => `<button class="notif-chip ${auditFilter === g[0] ? 'active' : ''}" onclick="setAuditFilter('${g[0]}')"><i class="fa-solid ${g[2]}"></i> ${g[1]} (${groups[g[0]].length})</button>`).join('') + '</div>';
            const shownGroups = AUDIT_GROUPS.filter(g => groups[g[0]].length > 0 && (auditFilter === 'all' || auditFilter === g[0]));
            container.innerHTML = chips + shownGroups.map(g => `
                <div class="audit-group">
                    <div class="audit-group-title"><i class="fa-solid ${g[2]}"></i> ${g[1]} <span class="bs-count">${groups[g[0]].length}</span></div>
                    <div style="display:flex; flex-direction:column; gap:10px;">${groups[g[0]].map(auditEntryHtml).join('')}</div>
                </div>`).join('');
        }

        function toggleAuditLogSelect(id, checked) {
            if (checked) selectedAuditLogIds.add(id); else selectedAuditLogIds.delete(id);
            refreshAuditLogDeleteBtn();
        }

        function refreshAuditLogDeleteBtn() {
            const btn = document.getElementById('auditLogDeleteBtn');
            if (!btn) return;
            btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selectedAuditLogIds.size})`;
            btn.classList.toggle('active', selectedAuditLogIds.size > 0);
        }

        function toggleSelectAllAuditLog(checked) {
            document.querySelectorAll('#auditLogContainer .admin-row-checkbox').forEach(cb => cb.checked = checked);
            if (checked) currentRenderedAuditLogIds.forEach(id => selectedAuditLogIds.add(id));
            else selectedAuditLogIds.clear();
            refreshAuditLogDeleteBtn();
        }

        function clampDateYear4(el) {
            const m = /^(\d{5,})-(\d{2})-(\d{2})$/.exec(el.value || '');
            if (m) el.value = m[1].slice(0, 4) + '-' + m[2] + '-' + m[3];
        }
        function showTripleConfirm(title, messages, onConfirm) {
            const step = (i) => {
                showConfirmBox(messages[i], () => {
                    if (i + 1 < messages.length) {
                        step(i + 1);
                        return { __keepOpen: true };
                    }
                    return onConfirm();
                }, title);
            };
            step(0);
        }

        function deleteSelectedAuditLogEntries() {
            if (selectedAuditLogIds.size === 0) return;
            const n = selectedAuditLogIds.size;
            const entryWord = n === 1 ? 'entry' : 'entries';
            showTripleConfirm('Delete Audit Log', [
                `You selected ${n} audit log ${entryWord} for deletion. Do you want to continue?`,
                `The selected ${entryWord} will be permanently removed. Do you still want to continue?`,
                'Final confirmation: this cannot be undone. Delete now?'
            ], () => {
                const idsToDelete = Array.from(selectedAuditLogIds);
                return apiRequest('/api/audit-log/bulk', 'DELETE', { ids: idsToDelete }).then(() => {
                    selectedAuditLogIds.clear();
                    refreshAuditLogFromServer();
                    showAlertBox('Selected audit log entries deleted successfully!');
                }).catch(err => {
                    showAlertBox(err.message || 'The delete did not reach the server (offline, or your session expired) — nothing was removed. Please try again.');
                });
            });
        }

        function clearAuditLog() {
            showTripleConfirm('Clear Audit Log', [
                'Do you want to clear the entire audit log?',
                'Every Create, Update, Delete, Export, and Change record will be permanently removed. Do you still want to continue?',
                'Final confirmation: this cannot be undone. Clear the audit log now?'
            ], () => {
                return apiRequest('/api/audit-log', 'DELETE').then(() => {
                    refreshAuditLogFromServer();
                    showAlertBox('Audit log cleared successfully!');
                }).catch(err => {
                    showAlertBox(err.message || 'The clear did not reach the server (offline, or your session expired) — nothing was removed. Please try again.');
                });
            });
        }

        let exportLockTimer = null;

        const EXPORT_OFFLINE_TEXT = 'You are Offline. Please check your internet connection.';

        function setExportModalMessage(text, kind) {
            const el = document.getElementById('exportModalMessage');
            if (!el) return;
            if (text && !navigator.onLine) {
                text = EXPORT_OFFLINE_TEXT;
                kind = 'error';
            }
            el.textContent = text || '';
            el.className = 'export-modal-message' + (kind ? ' ' + kind : '');
            el.style.display = text ? 'block' : 'none';
        }

        function formatWaitTime(totalSeconds) {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            if (h > 0) return `${h} hour${h === 1 ? '' : 's'} ${m} minute${m === 1 ? '' : 's'}`;
            if (m > 0) return `${m} minute${m === 1 ? '' : 's'} ${s} second${s === 1 ? '' : 's'}`;
            return `${s} second${s === 1 ? '' : 's'}`;
        }

        function startExportCountdown(seconds, messageFor, onDone) {
            clearInterval(exportLockTimer);
            const btn = document.getElementById('exportSubmitBtn');
            let left = seconds;
            btn.disabled = true;
            const tick = () => {
                if (left <= 0) {
                    clearInterval(exportLockTimer);
                    btn.disabled = false;
                    btn.textContent = 'Export';
                    if (onDone) onDone();
                    return;
                }
                btn.textContent = left > 3600 ? 'Locked' : `Wait ${left}s`;
                setExportModalMessage(messageFor(left), 'error');
                left--;
            };
            tick();
            exportLockTimer = setInterval(tick, 1000);
        }

        function ensureExportModal() {
            const existingModal = document.getElementById('exportPasswordModal');
            if (existingModal && document.getElementById('exportEmailStep')) return;
            if (existingModal) existingModal.remove();
            const holder = document.createElement('div');
            holder.innerHTML = `
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
                <button type="button" class="toggle-password" aria-label="Show or hide password" onclick="togglePasswordVisibility('exportPasswordInput', this)">${EYE_ICON_SVG}</button>
            </div>
            <div id="exportModalMessage" class="export-modal-message" style="display:none;"></div>
            <div class="modal-buttons">
                <button type="button" class="modal-btn btn-cancel" onclick="closeExportPasswordModal()">Cancel</button>
                <button type="button" class="modal-btn btn-confirm" id="exportSubmitBtn" onclick="submitExportStep()">Send Code</button>
            </div>
        </div>
    </div>`;
            document.body.appendChild(holder.firstElementChild);
        }

        let exportStep = 'otp';
        let exportResendTimer = null;

        let exportEmailValue = '';

        function setExportStep(step) {
            exportStep = step;
            const emailBox = document.getElementById('exportEmailStep');
            const otpBox = document.getElementById('exportOtpStep');
            const pwBox = document.getElementById('exportPasswordStep');
            const text = document.getElementById('exportModalText');
            const btn = document.getElementById('exportSubmitBtn');
            emailBox.style.display = step === 'email' ? 'block' : 'none';
            otpBox.style.display = step === 'otp' ? 'block' : 'none';
            pwBox.style.display = step === 'password' ? '' : 'none';
            if (step === 'email') {
                text.textContent = 'Enter your Gmail address. We will send a 6-digit verification code to it.';
                btn.textContent = 'Send Code';
                setTimeout(() => document.getElementById('exportEmailInput').focus(), 60);
            } else if (step === 'otp') {
                btn.textContent = 'Verify';
            } else {
                text.textContent = 'Code verified. For security, enter your account password to continue.';
                btn.textContent = 'Export';
                const input = document.getElementById('exportPasswordInput');
                input.value = '';
                input.type = 'password';
                input.setAttribute('readonly', 'readonly');
                const eyeBtn = document.querySelector('#exportPasswordModal .toggle-password');
                if (eyeBtn) eyeBtn.innerHTML = EYE_ICON_SVG;
                setTimeout(() => input.focus(), 60);
            }
        }

        function startExportResendWait(seconds) {
            clearInterval(exportResendTimer);
            const link = document.getElementById('exportResendBtn');
            if (!link) return;
            let left = seconds;
            const tick = () => {
                if (left <= 0) {
                    clearInterval(exportResendTimer);
                    link.textContent = 'Resend code';
                    link.classList.remove('disabled');
                    return;
                }
                link.textContent = `Resend code in ${left}s`;
                link.classList.add('disabled');
                left--;
            };
            tick();
            exportResendTimer = setInterval(tick, 1000);
        }

        function sendExportOtp() {
            const text = document.getElementById('exportModalText');
            const btn = document.getElementById('exportSubmitBtn');
            const wasStep = exportStep;
            btn.disabled = true;
            btn.textContent = 'Sending...';
            setExportModalMessage('', '');
            return apiRequest('/admin/export/send-otp', 'POST', { email: exportEmailValue }).then(res => {
                btn.disabled = false;
                setExportStep('otp');
                text.textContent = `We sent a 6-digit code to ${res.email || exportEmailValue}. Enter it below to continue.`;
                startExportResendWait(60);
                const input = document.getElementById('exportOtpInput');
                input.value = '';
                input.focus();
            }).catch(err => {
                btn.disabled = false;
                btn.textContent = wasStep === 'email' ? 'Send Code' : 'Verify';
                setExportModalMessage(err.isNetworkError ? EXPORT_OFFLINE_TEXT : err.message || 'Unable to send the verification email. Please try again.', 'error');
                if (wasStep === 'otp') startExportResendWait(5);
            });
        }

        function resendExportOtp() {
            const link = document.getElementById('exportResendBtn');
            if (link && link.classList.contains('disabled')) return;
            sendExportOtp();
        }

        function openExportPasswordModal() {
            try {
                openExportPasswordModalInner();
            } catch (err) {
                console.error('Export modal error:', err);
                showAlertBox('Export could not open: ' + (err && err.message ? err.message : 'unknown error') + '. Please refresh the page (Ctrl+Shift+R) and try again.');
            }
        }

        function openExportPasswordModalInner() {
            ensureExportModal();
            if (!donorsData || donorsData.length === 0) {
                showAlertBox('Cannot export: the Donor Masterlist is currently empty.');
                return;
            }
            clearInterval(exportLockTimer);
            clearInterval(exportResendTimer);
            document.getElementById('exportPasswordInput').value = '';
            document.getElementById('exportOtpInput').value = '';
            document.getElementById('exportEmailInput').value = '';
            exportEmailValue = '';
            document.getElementById('exportSubmitBtn').disabled = false;
            setExportStep('email');
            setExportModalMessage('', '');
            openModal('exportPasswordModal');
        }

        window.addEventListener('offline', () => {
            const modal = document.getElementById('exportPasswordModal');
            if (modal && modal.style.display === 'flex') setExportModalMessage(EXPORT_OFFLINE_TEXT, 'error');
        });
        window.addEventListener('online', () => {
            const modal = document.getElementById('exportPasswordModal');
            if (modal && modal.style.display === 'flex') setExportModalMessage('', '');
        });

        function closeExportPasswordModal() {
            clearInterval(exportLockTimer);
            clearInterval(exportResendTimer);
            document.getElementById('exportPasswordInput').value = '';
            document.getElementById('exportOtpInput').value = '';
            closeModal('exportPasswordModal');
        }

        function submitExportStep() {
            if (exportStep === 'email') submitExportEmail();
            else if (exportStep === 'otp') submitExportOtp();
            else submitExportPassword();
        }

        function submitExportEmail() {
            const btn = document.getElementById('exportSubmitBtn');
            if (btn.disabled) return;
            const email = document.getElementById('exportEmailInput').value.trim().toLowerCase();
            if (!GMAIL_RE.test(email)) {
                setExportModalMessage('Please enter a valid Gmail address (it must end with @gmail.com).', 'error');
                return;
            }
            exportEmailValue = email;
            sendExportOtp();
        }

        function submitExportOtp() {
            const btn = document.getElementById('exportSubmitBtn');
            if (btn.disabled) return;
            const code = document.getElementById('exportOtpInput').value.replace(/\D/g, '');
            if (code.length !== 6) {
                setExportModalMessage('Please enter the 6-digit code from your email.', 'error');
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Checking...';
            setExportModalMessage('', '');
            apiRequest('/admin/export/verify-otp', 'POST', { code }).then(() => {
                btn.disabled = false;
                setExportStep('password');
            }).catch(err => {
                btn.disabled = false;
                btn.textContent = 'Verify';
                setExportModalMessage(err.isNetworkError ? EXPORT_OFFLINE_TEXT : err.message || 'Invalid verification code. Please try again.', 'error');
                document.getElementById('exportOtpInput').focus();
            });
        }

        function submitExportPassword() {
            const btn = document.getElementById('exportSubmitBtn');
            if (btn.disabled) return;
            const input = document.getElementById('exportPasswordInput');
            const password = input.value;
            if (!password) {
                setExportModalMessage('Please enter your password.', 'error');
                return;
            }
            if (!navigator.onLine) {
                setExportModalMessage('You are Offline. Please check your internet connection.', 'error');
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Checking...';
            setExportModalMessage('', '');

            apiRequest('/admin/export/authorize', 'POST', { password }).then(res => {
                closeExportPasswordModal();
                exportDonorMasterlistCSV();
                const left = (res && typeof res.exports_left === 'number') ? res.exports_left : null;
                showAlertBox('Donor Masterlist exported successfully! Check your downloads folder.' +
                    (left !== null ? ` You have ${left} export${left === 1 ? '' : 's'} left in the next 24 hours.` : ''));
            }).catch(err => {
                btn.disabled = false;
                btn.textContent = 'Export';
                const d = err.data || {};
                input.value = '';
                if (err.status === 403 && d.code === 'otp_required') {
                    setExportStep('email');
                    setExportModalMessage('Please verify your Gmail with the code first.', 'error');
                } else if (err.status === 429 && d.code === 'quota') {
                    startExportCountdown(d.retry_after || 86400,
                        left => `Export limit reached. You can export again in ${formatWaitTime(left)}.`);
                } else if (err.status === 429) {
                    startExportCountdown(d.retry_after || 60,
                        left => `Too many incorrect password attempts. Please wait ${left} second${left === 1 ? '' : 's'} before trying again.`,
                        () => setExportModalMessage('You can enter your password again now.', 'info'));
                } else if (err.status === 422 && d.code === 'wrong') {
                    setExportModalMessage(`Incorrect password. ${d.attempts_left} attempt${d.attempts_left === 1 ? '' : 's'} left.`, 'error');
                    input.focus();
                } else if (err.isNetworkError) {
                    setExportModalMessage('You are Offline. Please check your internet connection.', 'error');
                } else {
                    setExportModalMessage(err.message || 'Something went wrong. Please try again.', 'error');
                }
            });
        }

        const XLSX_CRC_TABLE = (() => {
            const t = new Uint32Array(256);
            for (let n = 0; n < 256; n++) {
                let c = n;
                for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
                t[n] = c >>> 0;
            }
            return t;
        })();

        function xlsxCrc32(bytes) {
            let c = 0xFFFFFFFF;
            for (let i = 0; i < bytes.length; i++) c = XLSX_CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
            return (c ^ 0xFFFFFFFF) >>> 0;
        }

        function xlsxZip(files) {
            const enc = new TextEncoder();
            const chunks = [];
            const central = [];
            let offset = 0;
            const u16 = n => [n & 0xFF, (n >>> 8) & 0xFF];
            const u32 = n => [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF];
            files.forEach(f => {
                const name = enc.encode(f.name);
                const data = enc.encode(f.content);
                const crc = xlsxCrc32(data);
                const local = new Uint8Array([0x50, 0x4B, 0x03, 0x04, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)]);
                chunks.push(local, name, data);
                central.push({ name, crc, size: data.length, offset });
                offset += local.length + name.length + data.length;
            });
            let centralSize = 0;
            central.forEach(c => {
                const head = new Uint8Array([0x50, 0x4B, 0x01, 0x02, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c.crc), ...u32(c.size), ...u32(c.size), ...u16(c.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(c.offset)]);
                chunks.push(head, c.name);
                centralSize += head.length + c.name.length;
            });
            chunks.push(new Uint8Array([0x50, 0x4B, 0x05, 0x06, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(offset), ...u16(0)]));
            return new Blob(chunks, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        }

        function buildDonorXlsx(headers, rows, centerCols, wrapCols, sheetName, titleLines) {
            titleLines = titleLines || [];
            rows = rows.map(row => row.map(v => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? v.slice(5, 7) + '-' + v.slice(8, 10) + '-' + v.slice(0, 4) : v));
            const hdr = titleLines.length ? titleLines.length + 2 : 1;
            const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            const colName = i => {
                let n = i + 1, out = '';
                while (n > 0) { const m = (n - 1) % 26; out = String.fromCharCode(65 + m) + out; n = Math.floor((n - 1) / 26); }
                return out;
            };
            const widths = headers.map((h, c) => {
                let max = String(h).length;
                rows.forEach(r => {
                    String(r[c] === undefined || r[c] === null ? '' : r[c]).split('\n').forEach(line => { max = Math.max(max, line.length); });
                });
                return Math.max(12, Math.min(max + 4, wrapCols.has(c) ? 38 : 46));
            });
            const cell = (ref, value, style, forceText) => {
                if (value === '' || value === null || value === undefined) return `<c r="${ref}" s="${style}"/>`;
                if (!forceText && typeof value === 'number' && isFinite(value)) return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
                return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
            };
            let sheetRows = '';
            titleLines.forEach((line, i) => {
                sheetRows += `<row r="${i + 1}" ht="${i === 0 ? 34 : 22}" customHeight="1">` + cell('A' + (i + 1), line, i === 0 ? 4 : 5, true) + '</row>';
            });
            sheetRows += `<row r="${hdr}" ht="30" customHeight="1">` + headers.map((h, c) => cell(colName(c) + hdr, h, 1, true)).join('') + '</row>';
            rows.forEach((row, r) => {
                const rn = r + hdr + 1;
                sheetRows += `<row r="${rn}">` + row.map((v, c) => cell(colName(c) + rn, v, centerCols.has(c) ? 3 : 2, c === 4 || c === headers.length - 1)).join('') + '</row>';
            });
            const lastRef = colName(headers.length - 1) + (rows.length + hdr);
            const lastCol = colName(headers.length - 1);
            const mergeXml = titleLines.length ? `<mergeCells count="${titleLines.length}">` + titleLines.map((_, i) => `<mergeCell ref="A${i + 1}:${lastCol}${i + 1}"/>`).join('') + '</mergeCells>' : '';
            const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
                `<dimension ref="A1:${lastRef}"/>` +
                '<sheetViews><sheetView workbookViewId="0" showGridLines="1"><pane ySplit="' + hdr + '" topLeftCell="A' + (hdr + 1) + '" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
                '<sheetFormatPr defaultRowHeight="18"/>' +
                '<cols>' + widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>' +
                `<sheetData>${sheetRows}</sheetData>` +
                `<autoFilter ref="A${hdr}:${lastRef}"/>` + mergeXml +
                '<pageMargins left="0.5" right="0.5" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>' +
                '<pageSetup orientation="landscape" fitToHeight="0"/>' +
                '</worksheet>';
            const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
                '<fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="18"/><color rgb="FFC8102E"/><name val="Calibri"/></font><font><b/><sz val="12"/><name val="Calibri"/></font></fonts>' +
                '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFC8102E"/><bgColor indexed="64"/></patternFill></fill></fills>' +
                '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border></borders>' +
                '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
                '<cellXfs count="6">' +
                '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
                '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
                '<xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>' +
                '<xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
                '<xf numFmtId="49" fontId="2" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
                '<xf numFmtId="49" fontId="3" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
                '</cellXfs>' +
                '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
                '</styleSheet>';
            const files = [
                { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
                { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + (sheetName || 'Donor Masterlist') + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
                { name: 'xl/_rels/workbook.xml.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
                { name: 'xl/styles.xml', content: styles },
                { name: 'xl/worksheets/sheet1.xml', content: sheet }
            ];
            return xlsxZip(files);
        }

        function exportDonorMasterlistCSV() {
            if (!donorsData || donorsData.length === 0) {
                showAlertBox('Cannot export: the Donor Masterlist is currently empty.');
                return;
            }
            const includeMedical = isAdminUser();
            const headers = ['ID', 'Full Name', 'Blood Type', 'Barangay', 'Contact', 'Birthday', 'New Donation', 'Times Donated', 'Weight (kg)', 'Blood Pressure', 'Height (cm)', 'Eligibility Status', 'Allergies', ...(includeMedical ? ['Medical Conditions'] : []), 'Deferral/Screening Notes', 'Emergency Contact Name', 'Emergency Contact Number'];
            const rowsRaw = donorsData.map(d => [
                d.id, d.name, d.bloodType, d.brgy, d.contact, d.bday, d.lastDonation, d.timesDonated,
                d.weight || 'N/A', d.bp || 'N/A', d.height || 'N/A', d.eligibilityStatus || 'Eligible', d.allergies || 'None', ...(includeMedical ? [d.medicalConditions || 'None'] : []),
                d.deferralReason || '', d.emergencyContactName || '', d.emergencyContactNumber || ''
            ].map(v => (v === undefined || v === null ? '' : v)));
            const todayStr = new Date().toISOString().split('T')[0];
            const filenameBase = `REDFLOW_Donor_Masterlist_${todayStr}`;

            const finishExportLog = () => {
                const actingUser = getCurrentUserForAudit();
                const auditLog = safeParseJSON('redflow_audit_log') || [];
                auditLog.unshift({
                    id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                    timestamp: new Date().toISOString(),
                    userId: actingUser.id,
                    userName: actingUser.name,
                    userRole: actingUser.role,
                    action: 'Export',
                    donorId: null,
                    donorName: `Full Masterlist (${donorsData.length} donors)`
                });
                if (auditLog.length > AUDIT_LOG_MAX_ENTRIES) auditLog.length = AUDIT_LOG_MAX_ENTRIES;
                localStorage.setItem('redflow_audit_log', JSON.stringify(auditLog));
                renderAuditLogView();
            };

            try {
                const centerHeaders = new Set(['ID', 'Blood Type', 'Contact', 'Birthday', 'New Donation', 'Times Donated', 'Weight (kg)', 'Blood Pressure', 'Height (cm)', 'Eligibility Status', 'Emergency Contact Number']);
                const wrapHeaders = new Set(['Allergies', 'Medical Conditions', 'Deferral/Screening Notes']);
                const centerCols = new Set(), wrapCols = new Set();
                headers.forEach((h, i) => { if (centerHeaders.has(h)) centerCols.add(i); if (wrapHeaders.has(h)) wrapCols.add(i); });
                const cleanRows = rowsRaw.map(row => row.map((v, c) => {
                    if (v === null || v === undefined || (typeof v === 'string' && (v.trim() === '' || v.trim().toUpperCase() === 'N/A'))) return 'N/A';
                    if ((c === 0 || headers[c] === 'Times Donated' || headers[c] === 'Weight (kg)') && v !== '' && isFinite(Number(v))) return Number(v);
                    return v;
                }));
                const mastYear = new Date().getFullYear();
                const qualifiedCount = donorsData.filter(d => normElig(d.eligibilityStatus) === 'Eligible').length;
                const xlsxBlob = buildDonorXlsx(headers, cleanRows, centerCols, wrapCols, 'Donor Masterlist', ['Donor Masterlist In Irosin ' + mastYear, 'Total Donors: ' + donorsData.length + '   |   Eligible: ' + qualifiedCount]);
                const xlsxUrl = URL.createObjectURL(xlsxBlob);
                const xlsxLink = document.createElement('a');
                xlsxLink.href = xlsxUrl;
                xlsxLink.download = `${filenameBase}.xlsx`;
                document.body.appendChild(xlsxLink);
                xlsxLink.click();
                document.body.removeChild(xlsxLink);
                setTimeout(() => URL.revokeObjectURL(xlsxUrl), 4000);
                finishExportLog();
                return;
            } catch (xlsxErr) {
                console.error('XLSX build failed, using CSV fallback:', xlsxErr);
            }

            const escapeCsv = (val) => {
                const str = String(val === undefined || val === null ? '' : val);
                return /["\n,]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
            };
            const csvContent = [headers.map(escapeCsv).join(','), ...rowsRaw.map(row => row.map(escapeCsv).join(','))].join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filenameBase}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            finishExportLog();
        }

        let currentProfileDonorSnapshot = null;

        function openDonorProfile(donor) {
            isViewingStaff = false;
            activeSelectedDonorId = donor.id;
            currentProfileDonorSnapshot = donor;
            const middleNameValue = donor.middleName && donor.middleName.trim() !== "" ? donor.middleName : "N/A";
            const container = document.getElementById('profile-container-box');
            container.innerHTML = `
                <div class="profile-back-row"><button type="button" class="profile-back-btn" onclick="switchMainPage('home', document.querySelector('.bottom-nav-item'))"><i class="fa-solid fa-arrow-left"></i> Back</button></div>
                <h2>DONOR INFORMATION</h2>
                ${donor.createdBy ? `<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:-8px; margin-bottom:12px;">Created by: ${esc(donor.createdBy)}${donor.createdAt ? ' &middot; Created on: ' + esc(formatLoginTimestamp(donor.createdAt)) : ''}</p>` : (donor.createdAt ? `<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:-8px; margin-bottom:12px;">Created on: ${esc(formatLoginTimestamp(donor.createdAt))}</p>` : '')}
                
                <input type="file" id="profileImageFile" accept="image/*" style="display: none;" onchange="handleProfileImageUpload(event)">
                
                <div class="profile-avatar-large" onclick="document.getElementById('profileImageFile').click()" title="Click to change photo">
                    <img id="profileAvatarImg" src="${esc(donorAvatarSrc(donor))}" alt="Profile" onerror="this.onerror=null;this.src='${defaultAvatarForSex(donor.sex || donor.gender)}'">
                </div>
                <div class="profile-photo-change-text" onclick="document.getElementById('profileImageFile').click()">
                    <i class="fa-solid fa-camera"></i> Click to change photo
                </div>
                <div id="donorAvatarPickerBox" style="display:none;">
                    <div class="avatar-picker-label">Or choose an avatar</div>
                    <div class="avatar-picker" id="donorAvatarPicker">
                        ${AVATAR_CHOICES.map(f => `<button type="button" class="avatar-choice ${donorAvatarSrc(donor) === AVATAR_DIR + f ? 'selected' : ''}" onclick="chooseDonorProfileAvatar('${f}')" title="${f.replace('.jpg','')}"><img src="${AVATAR_DIR + f}" alt="${f}"></button>`).join('')}
                    </div>
                </div>
                
                <form onsubmit="event.preventDefault();">
                    <input type="hidden" id="prof_donorId" value="${esc(donor.id)}">
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>FIRST NAME</label>
                            <input type="text" id="prof_firstName" value="${esc(donor.firstName || donor.name.split(' ')[0])}" required disabled>
                        </div>
                        <div class="form-group-custom">
                            <label>MIDDLE NAME</label>
                            <input type="text" id="prof_middleName" value="${esc(middleNameValue)}" disabled>
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>SURNAME</label>
                            <input type="text" id="prof_surname" value="${esc(donor.surname || donor.name.split(' ').slice(1).join(' '))}" required disabled>
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>EXT. NAME</label>
                            <select id="prof_ext" disabled>
                                <option value="" ${!donor.ext ? 'selected' : ''}>None</option>
                                <option value="Jr." ${donor.ext === 'Jr.' ? 'selected' : ''}>Jr.</option>
                                <option value="Sr." ${donor.ext === 'Sr.' ? 'selected' : ''}>Sr.</option>
                                <option value="II" ${donor.ext === 'II' ? 'selected' : ''}>II</option>
                                <option value="III" ${donor.ext === 'III' ? 'selected' : ''}>III</option>
                                <option value="IV" ${donor.ext === 'IV' ? 'selected' : ''}>IV</option>
                                <option value="V" ${donor.ext === 'V' ? 'selected' : ''}>V</option>
                            </select>
                        </div>
                        <div class="form-group-custom">
                            <label>BLOOD TYPE</label>
                            <select id="prof_bloodType" disabled data-lock="0">
                                ${(donor.bloodType && !['A+','A-','B+','B-','AB+','AB-','O+','O-'].includes(donor.bloodType)) ? `<option value="${esc(donor.bloodType)}" selected>${esc(donor.bloodType)}</option>` : ''}
                                <option value="A+" ${donor.bloodType === 'A+' ? 'selected' : ''}>A+</option>
                                <option value="A-" ${donor.bloodType === 'A-' ? 'selected' : ''}>A-</option>
                                <option value="B+" ${donor.bloodType === 'B+' ? 'selected' : ''}>B+</option>
                                <option value="B-" ${donor.bloodType === 'B-' ? 'selected' : ''}>B-</option>
                                <option value="AB+" ${donor.bloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                                <option value="AB-" ${donor.bloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                                <option value="O+" ${donor.bloodType === 'O+' ? 'selected' : ''}>O+</option>
                                <option value="O-" ${donor.bloodType === 'O-' ? 'selected' : ''}>O-</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>BIRTHDAY (DATE OF BIRTH)</label>
                            <input type="date" id="prof_bday" value="${esc(donor.bday || '')}" max="${maxAdultBirthdateISO()}" required disabled>
                        </div>
                        <div class="form-group-custom">
                            <label>SEX</label>
                            <select id="prof_sex" disabled>
                                ${(donor.sex !== 'Male' && donor.sex !== 'Female') ? `<option value="${esc(donor.sex || 'N/A')}" selected>${esc(donor.sex || 'N/A')}</option>` : ''}
                                <option value="Male" ${donor.sex === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${donor.sex === 'Female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>CONTACT NUMBER</label>
                            ${phoneFieldHtml('prof_contact', donor.contact, true)}
                        </div>
                        <div class="form-group-custom">
                            <label>LOCATION</label>
                            <input type="text" id="prof_location" value="${esc(donor.brgy)}, Irosin, Sorsogon, Bicol, Philippines" required disabled>
                        </div>
                    </div>
                    
                    <div style="margin-top:25px; margin-bottom:10px; border-top:1px solid var(--border-color); padding-top:15px;">
                        <div style="font-weight:bold; color:var(--primary-red); font-size:14px; letter-spacing:0.5px; text-transform:uppercase;">Health &amp; Additional Information</div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">For reference only. Final medical screening and eligibility must always be confirmed by authorized health personnel.</div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>WEIGHT (KG)</label>
                            <input type="text" id="prof_weight" value="${esc(donor.weight && donor.weight !== 'N/A' ? donor.weight : '')}" placeholder="e.g. 60" disabled>
                        </div>
                        <div class="form-group-custom">
                            <label>DONATION ELIGIBILITY STATUS</label>
                            ${comboHtml('prof_eligibilityStatus', 'eligibility', donor.eligibilityStatus || 'Eligible', true)}
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>BLOOD PRESSURE</label>
                            <input type="text" id="prof_bp" value="${esc(donor.bp && donor.bp !== 'N/A' ? donor.bp : '')}" placeholder="e.g. 120/80" maxlength="7" disabled>
                        </div>
                        <div class="form-group-custom">
                            <label>HEIGHT (CM)</label>
                            <input type="text" id="prof_height" value="${esc(donor.height && donor.height !== 'N/A' ? donor.height : '')}" placeholder="e.g. 165" disabled>
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>HEMOGLOBIN (G/DL)</label>
                            <input type="text" id="prof_hemoglobin" value="${esc(donor.hemoglobin && donor.hemoglobin !== 'N/A' ? donor.hemoglobin : '')}" placeholder="e.g. 13.5" maxlength="5" disabled>
                        </div>
                        <div class="form-group-custom"></div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>KNOWN ALLERGIES</label>
                            ${comboHtml('prof_allergies', 'allergies', donor.allergies, true)}
                        </div>
                        <div class="form-group-custom">
                            <label>EXISTING MEDICAL CONDITIONS</label>
                            ${comboHtml('prof_medicalConditions', 'medical', donor.medicalConditions, true, "onMedicalComboChange('prof_medicalConditions','prof_eligibilityStatus')")}
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom" style="flex:1 1 100%;">
                            <label>DEFERRAL / SCREENING NOTES</label>
                            ${comboHtml('prof_deferralReason', 'screening', donor.deferralReason, true, "onMedicalComboChange('prof_medicalConditions','prof_eligibilityStatus')")}
                        </div>
                    </div>
                    <div class="form-row-dual">
                        <div class="form-group-custom">
                            <label>EMERGENCY CONTACT NAME</label>
                            <input type="text" id="prof_emergencyContactName" value="${esc(donor.emergencyContactName || '')}" placeholder="Full name" disabled>
                        </div>
                        <div class="form-group-custom">
                            <label>EMERGENCY CONTACT NUMBER</label>
                            ${phoneFieldHtml('prof_emergencyContactNumber', donor.emergencyContactNumber, true, 'Emergency Contact Number')}
                        </div>
                    </div>

                    <div id="donorProfileViewButtons">
                        <button type="button" onclick="enterDonorProfileEditMode()" style="width: 100%; padding: 14px; background-color: #222; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 15px;"><i class="fa-solid fa-pen"></i> Edit</button>
                    </div>
                    <div class="profile-reason-box" id="donorEditReasonBox" style="display:none;">
                        <label for="prof_editReason">What is your reason to update or edit donor information? *</label>
                        <textarea id="prof_editReason" placeholder="Type your reason here..."></textarea>
                    </div>
                    <div id="donorProfileEditButtons" style="display:none; gap:12px; margin-top:15px;">
                        <button type="button" onclick="cancelDonorProfileEditMode()" style="flex:1; padding: 14px; background-color: var(--primary-red); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">Cancel</button>
                        <button type="button" id="donorProfileUpdateBtn" onclick="updateDonorProfileData()" style="flex:1; padding: 14px; background-color: var(--success-green); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">${isAdminUser() ? 'Update' : 'Submit Edit Request'}</button>
                    </div>
                    
                </form>
            `;
            switchMainPage('profile', null);
        }

        function autoSuggestEligibilityFromMedicalCondition(value, targetFieldId = 'prof_eligibilityStatus') {
            const eligibilityField = document.getElementById(targetFieldId);
            if (!eligibilityField || eligibilityField.disabled) return;
            const trimmed = (value || '').trim();
            eligibilityField.value = (trimmed && trimmed.toLowerCase() !== 'none') ? 'Deferred' : 'Eligible';
        }

        function enterDonorProfileEditMode() {
            const ids = ['prof_firstName','prof_middleName','prof_surname','prof_ext','prof_bday','prof_sex',
                'prof_contact','prof_location','prof_weight','prof_bp','prof_height','prof_hemoglobin','prof_emergencyContactName','prof_emergencyContactNumber'];
            ids.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = false; });
            ['prof_eligibilityStatus','prof_allergies','prof_medicalConditions','prof_deferralReason'].forEach(id => setComboDisabled(id, false));
            const rb = document.getElementById('donorEditReasonBox');
            if (rb) rb.style.display = isAdminUser() ? 'none' : 'block';
            const apb = document.getElementById('donorAvatarPickerBox');
            if (apb) apb.style.display = 'block';
            const bt = document.getElementById('prof_bloodType');
            if (bt && bt.dataset.lock !== '1') bt.disabled = false;
            const vb = document.getElementById('donorProfileViewButtons');
            const eb = document.getElementById('donorProfileEditButtons');
            if (vb) vb.style.display = 'none';
            if (eb) eb.style.display = 'flex';
        }

        function cancelDonorProfileEditMode() {
            if (currentProfileDonorSnapshot) {
                openDonorProfile(currentProfileDonorSnapshot);
            }
        }

    function updateDonorProfileData() {
            const donorId = parseInt(document.getElementById('prof_donorId').value);
            const fName = document.getElementById('prof_firstName').value;
            let mName = document.getElementById('prof_middleName').value.trim();
            if (mName === "N/A" || mName === "") {
                mName = "";
            }
            const lName = document.getElementById('prof_surname').value;
            const ext = document.getElementById('prof_ext').value.trim();
            const sexField = document.getElementById('prof_sex');
            const sex = sexField ? sexField.value : '';
            const fullName = `${fName} ${mName ? mName + ' ' : ''}${lName}${ext ? ' ' + ext : ''}`;
            let bloodType = document.getElementById('prof_bloodType').value;
            const rawLoc = document.getElementById('prof_location').value;
            const brgyOnly = rawLoc.split(',')[0].trim();
            const contact = phoneFull('prof_contact');
            const bday = document.getElementById('prof_bday').value;
            const avatar = document.getElementById('profileAvatarImg').src;

            const existingDonorRecord = donorsData.find(d => d.id === donorId);

            const profWeightRaw = (document.getElementById('prof_weight') || {}).value || '';
            const profEmName = ((document.getElementById('prof_emergencyContactName') || {}).value || '').trim();
            if (!fName.trim() || !lName.trim() || !bday || !sex || !isValidPh10('prof_contact') && !document.getElementById('prof_contact').value.trim() || !rawLoc.trim() || !profWeightRaw.trim() || !profEmName || !document.getElementById('prof_emergencyContactNumber').value.trim() || !getComboValue('prof_eligibilityStatus')) {
                showAlertBox(REQUIRED_MSG);
                return;
            }
            const profBErr = birthdateError(bday, 'donors');
            if (profBErr) { showAlertBox(profBErr); return; }
            if (!isValidPh10('prof_contact')) { showAlertBox('Please enter your complete contact number after +63.'); return; }
            if (!isValidPh10('prof_emergencyContactNumber')) { showAlertBox('Please enter the complete Emergency Contact Number after +63.'); return; }
            const profEmptyOther = firstEmptyOther([
                ['prof_eligibilityStatus', 'Eligibility Status'], ['prof_allergies', 'Known Allergies'],
                ['prof_medicalConditions', 'Existing Medical Conditions'], ['prof_deferralReason', 'Deferral / Screening Notes']
            ]);
            if (profEmptyOther) { alertSpecifyOther(profEmptyOther); return; }

            if (!isAdminUser()) {
                const reasonEl = document.getElementById('prof_editReason');
                const reason = reasonEl ? reasonEl.value.trim() : '';
                const medEl = document.getElementById('prof_medicalConditions');
                const proposed = {
                    firstName: fName, middleName: mName, surname: lName, ext: ext, sex: sex, bday: bday,
                    bloodType: bloodType,
                    contact: contact, brgy: brgyOnly, weight: profWeightRaw.trim(),
                    bp: ((document.getElementById('prof_bp') || {}).value || '').trim(), height: ((document.getElementById('prof_height') || {}).value || '').trim(), hemoglobin: ((document.getElementById('prof_hemoglobin') || {}).value || '').trim(),
                    eligibilityStatus: getComboValue('prof_eligibilityStatus'),
                    allergies: getComboValue('prof_allergies') || 'None',
                    medicalConditions: (medEl && medEl.tagName === 'SELECT') ? (getComboValue('prof_medicalConditions') || 'None') : ((existingDonorRecord && existingDonorRecord.medicalConditions) || 'None'),
                    deferralReason: getComboValue('prof_deferralReason') === 'None' ? '' : getComboValue('prof_deferralReason'),
                    emergencyContactName: profEmName, emergencyContactNumber: phoneFull('prof_emergencyContactNumber')
                };
                const before = existingDonorRecord || {};
                const changed = {};
                const labels = [];
                Object.keys(REQ_FIELD_LABELS).forEach(k => {
                    if (Object.prototype.hasOwnProperty.call(proposed, k) && String(before[k] == null ? '' : before[k]) !== String(proposed[k] == null ? '' : proposed[k])) {
                        changed[k] = proposed[k]; labels.push(REQ_FIELD_LABELS[k]);
                    }
                });
                if (labels.length === 0) { showAlertBox('Please change at least one donor information field before submitting an edit request.'); return; }
                if (!reason) { showAlertBox('Please enter your reason to update or edit donor information.'); if (reasonEl) reasonEl.focus(); return; }
                if (changed.firstName !== undefined || changed.middleName !== undefined || changed.surname !== undefined || changed.ext !== undefined) {
                    changed.name = fullName;
                }
                const btn = document.getElementById('donorProfileUpdateBtn');
                const btnHtml = btn ? btn.innerHTML : '';
                if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...'; }
                const original = {};
                Object.keys(REQ_FIELD_LABELS).forEach(k => original[k] = before[k] == null ? '' : before[k]);
                apiRequest('/api/edit-requests', 'POST', {
                    type: 'donor_edit', donorId: donorId, donorName: before.name || fullName,
                    payload: changed, original: original, reason: reason, fieldLabels: labels
                }).then(() => {
                    showAlertBox('Edit request submitted successfully! The Administrator was notified and must approve it before the donor information changes.');
                    loadEditRequests();
                    openDonorProfile(existingDonorRecord || currentProfileDonorSnapshot);
                }).catch(err => {
                    showAlertBox(err.message || 'Error: Could not submit the edit request. Please try again.');
                    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = btnHtml; }
                });
                return;
            }

            function finishProfileUpdate() {
                const updateBtn = document.getElementById('donorProfileUpdateBtn');
                const updateBtnOriginalText = updateBtn ? updateBtn.innerHTML : '';
                if (updateBtn) {
                    updateBtn.disabled = true;
                    updateBtn.style.opacity = '0.7';
                    updateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
                }

                const mismatchedHistoryRecord = monitoringRecords.find(r => r.donorId && String(r.donorId) === String(donorId) && r.bloodType && r.bloodType !== bloodType);
                if (mismatchedHistoryRecord) {
                    showAlertBox(`Warning: A History Record on file for this donor shows blood type ${mismatchedHistoryRecord.bloodType}, which no longer matches ${bloodType}. Please verify before relying on this record.`);
                }

                const weightField = document.getElementById('prof_weight');
                const eligibilityField = document.getElementById('prof_eligibilityStatus');
                const allergiesField = document.getElementById('prof_allergies');
                const medicalConditionsField = document.getElementById('prof_medicalConditions');
                const deferralReasonField = document.getElementById('prof_deferralReason');
                const emergencyNameField = document.getElementById('prof_emergencyContactName');
                const emergencyNumberField = document.getElementById('prof_emergencyContactNumber');

                const weight = weightField && weightField.value.trim() !== '' ? weightField.value.trim() : 'N/A';
                const profBpVal = ((document.getElementById('prof_bp') || {}).value || '').trim();
                const profHeightVal = ((document.getElementById('prof_height') || {}).value || '').trim();
                const profHbVal = ((document.getElementById('prof_hemoglobin') || {}).value || '').trim();
                const eligibilityStatus = getComboValue('prof_eligibilityStatus') || 'Eligible';
                const allergies = getComboValue('prof_allergies') || 'None';
                const medicalConditions = (medicalConditionsField && medicalConditionsField.tagName === 'SELECT') ? (getComboValue('prof_medicalConditions') || 'None') : (medicalConditionsField && medicalConditionsField.value.trim() !== '' ? medicalConditionsField.value.trim() : 'None');
                const deferralReason = getComboValue('prof_deferralReason') === 'None' ? '' : getComboValue('prof_deferralReason');
                const emergencyContactName = emergencyNameField ? emergencyNameField.value.trim() : '';
                const emergencyContactNumber = phoneFull('prof_emergencyContactNumber');

                const donorIndex = donorsData.findIndex(d => d.id === donorId);
                if (donorIndex !== -1) {
                    const beforeEdit = donorsData[donorIndex];
                    const afterEdit = {
                        ...beforeEdit,
                        gender: sex,
                        name: fullName,
                        firstName: fName,
                        middleName: mName,
                        surname: lName,
                        ext: ext,
                        sex: sex,
                        bloodType: bloodType,
                        brgy: brgyOnly,
                        contact: contact,
                        bday: bday,
                        avatar: avatar,
                        weight: weight,
                        bp: profBpVal,
                        height: profHeightVal,
                        hemoglobin: profHbVal,
                        eligibilityStatus: eligibilityStatus,
                        allergies: allergies,
                        medicalConditions: medicalConditions,
                        deferralReason: deferralReason,
                        emergencyContactName: emergencyContactName,
                        emergencyContactNumber: emergencyContactNumber
                    };
                    const trackedFields = {
                        firstName: 'First Name', middleName: 'Middle Name', surname: 'Surname',
                        ext: 'Ext.', sex: 'Sex/Gender', bloodType: 'Blood Type', brgy: 'Barangay',
                        contact: 'Contact Number', bday: 'Birthday', weight: 'Weight', bp: 'Blood Pressure', height: 'Height', hemoglobin: 'Hemoglobin',
                        eligibilityStatus: 'Eligibility Status', allergies: 'Allergies',
                        medicalConditions: 'Medical Conditions', deferralReason: 'Deferral Notes',
                        emergencyContactName: 'Emergency Contact Name', emergencyContactNumber: 'Emergency Contact Number'
                    };
                    const changeDetails = Object.keys(trackedFields)
                        .filter(key => (beforeEdit[key] || '') !== (afterEdit[key] || ''))
                        .map(key => `${trackedFields[key]}: ${beforeEdit[key] || 'None'} > ${afterEdit[key] || 'None'}`);

                    donorsData[donorIndex] = afterEdit;
                    localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                    if (changeDetails.length > 0) {
                        logAuditEvent('Update', donorsData[donorIndex], formatChangeParts(changeDetails));
                    }

                    const recIndex = monitoringRecords.findIndex(r => (r.donorId && String(r.donorId) === String(donorId)) || (r.name && r.name.trim().toLowerCase() === (beforeEdit.name || '').trim().toLowerCase()));
                    if (recIndex !== -1) {
                        monitoringRecords[recIndex].donorId = donorId;
                        monitoringRecords[recIndex].name = fullName;
                        monitoringRecords[recIndex].location = `${brgyOnly}, Irosin, Sorsogon, Bicol, Philippines`;
                        monitoringRecords[recIndex].bloodType = bloodType;
                        localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));
                        renderMonitoringTable();
                    }

                    currentProfileDonorSnapshot = afterEdit;

                    apiRequest('/api/donors/' + donorId, 'PUT', { ...afterEdit, _auditDetails: formatChangeParts(changeDetails) }).then(() => {
                        if (recIndex !== -1) {
                            apiRequest('/api/donation-records', 'POST', monitoringRecords[recIndex]).catch(() => {});
                        }
                        renderDonorCards();
                        updateStatisticsData();
                        showAlertBox(changeDetails.length ? 'Change: ' + changeDetails.join('\nChange: ') : 'No changes were made.');
                        openDonorProfile(currentProfileDonorSnapshot);
                    }).catch(err => {
                        renderDonorCards();
                        updateStatisticsData();
                        showAlertBox(err.isNetworkError
                            ? 'No internet connection. The update was saved on this device only and will need to be re-applied once you are back online.'
                            : 'Warning: Could not save this update to the shared database (' + (err.message || 'unknown error') + "). It is only saved on this device for now.");
                        openDonorProfile(currentProfileDonorSnapshot);
                    }).finally(() => {
                        if (updateBtn) {
                            updateBtn.disabled = false;
                            updateBtn.style.opacity = '1';
                            updateBtn.innerHTML = updateBtnOriginalText;
                        }
                    });
                } else {
                    if (updateBtn) {
                        updateBtn.disabled = false;
                        updateBtn.style.opacity = '1';
                        updateBtn.innerHTML = updateBtnOriginalText;
                    }
                }
            }

            if (existingDonorRecord && existingDonorRecord.bloodType && existingDonorRecord.bloodType !== bloodType) {
                showConfirmBox(`Blood type change detected for ${fullName}: ${existingDonorRecord.bloodType} → ${bloodType}. This is a critical field. Confirm this is a verified correction and NOT a typo before proceeding.`, () => {
                    finishProfileUpdate();
                }, 'Confirm Blood Type Change');
                return;
            }

            finishProfileUpdate();
        }

        let historyFormOrigin = 'home';
        function updateHistoryTimes() {
            const timesEl = document.getElementById('history_form_times');
            if (timesEl && timesEl.dataset.touched !== '1') timesEl.value = timesEl.dataset.suggest || '1';
        }
        function cancelCreateHistoryForm() {
            const profileHasDonor = document.getElementById('prof_donorId') && document.getElementById('prof_donorId').value;
            if (historyFormOrigin === 'profile' && profileHasDonor) switchMainPage('profile', null);
            else switchMainPage('home', null);
        }
        function suggestedTimesDonated(donorId, name, donorRecord) {
            const nm = String(name || '').trim().toLowerCase();
            const rec = monitoringRecords.find(r => (donorId && r.donorId && String(r.donorId) === String(donorId)) || (!r.donorId && r.name && r.name.trim().toLowerCase() === nm));
            let cur = 0;
            if (rec) {
                const typed = parseInt(rec.timesDonated, 10);
                cur = !isNaN(typed) && typed >= 0 ? typed : 1;
            } else if (donorRecord && donorRecord.timesDonated && donorRecord.timesDonated !== 'N/A') {
                cur = parseInt(donorRecord.timesDonated, 10) || 0;
            }
            return String(cur + 1);
        }
        function fillHistoryForm(donorId, fullName, bloodType, rawLoc, donorRecord, pendingReqId) {
            document.getElementById('history_form_donorId').value = donorId || '';
            document.getElementById('history_form_pendingReqId').value = pendingReqId || '';
            document.getElementById('history_form_name').value = fullName;
            document.getElementById('history_form_location').value = rawLoc.includes('Irosin') ? rawLoc : `${rawLoc}, Irosin, Sorsogon, Bicol, Philippines`;
            document.getElementById('history_form_bloodType').value = bloodType;
            document.getElementById('history_form_bloodType').disabled = false;
            document.getElementById('history_form_newDonation').value = '';
            const timesEl = document.getElementById('history_form_times');
            timesEl.dataset.suggest = suggestedTimesDonated(donorId, fullName, donorRecord);
            timesEl.dataset.touched = '';
            timesEl.value = timesEl.dataset.suggest;
            document.getElementById('history_form_amount').value = '1 Bag';
            const submitBtn = document.getElementById('historyFormSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = 'Create';
            switchMainPage('create-history-form', null);
        }
        function openCreateHistoryFromPending(reqId) {
            const r = editRequests.find(x => String(x.id) === String(reqId));
            if (!r) return;
            const p = r.payload || {};
            historyFormOrigin = 'home';
            fillHistoryForm('', p.name || r.donorName || '', p.bloodType || '', p.brgy || '', null, r.id);
        }
        function openCreateHistoryForm(donorIdArg) {
            const fromRow = donorIdArg !== undefined && donorIdArg !== null;
            const donorId = fromRow ? String(donorIdArg) : (document.getElementById('prof_donorId') ? document.getElementById('prof_donorId').value : '');
            const donorRecord = donorsData.find(d => String(d.id) === String(donorId));
            if (fromRow && !donorRecord) return;
            historyFormOrigin = fromRow ? 'home' : 'profile';
            let fullName, bloodType, rawLoc;
            if (fromRow) {
                fullName = donorRecord.name;
                bloodType = donorRecord.bloodType;
                rawLoc = donorRecord.brgy || '';
            } else {
                const fName = document.getElementById('prof_firstName').value;
                const mName = document.getElementById('prof_middleName').value;
                const lName = document.getElementById('prof_surname').value;
                const validMName = (mName && mName !== "N/A") ? mName + ' ' : '';
                fullName = `${fName} ${validMName}${lName}`;
                bloodType = document.getElementById('prof_bloodType').value;
                rawLoc = document.getElementById('prof_location').value;
            }
            fillHistoryForm(donorId, fullName, bloodType, rawLoc, donorRecord, '');
        }

        function updateHistoryStatusColor(selectEl) {
            if (!selectEl) return;
            if (selectEl.value === 'Approved') {
                selectEl.style.background = 'var(--success-green)';
                selectEl.style.borderColor = 'var(--success-green)';
                selectEl.style.color = '#fff';
            } else {
                selectEl.style.background = 'var(--warning-orange)';
                selectEl.style.borderColor = 'var(--warning-orange)';
                selectEl.style.color = '#222';
            }
        }

        let isApprovingHistoryRecord = false;
        function recomputeRecordDates(rec) {
            const iso = /^\d{4}-\d{2}-\d{2}$/;
            const map = new Map();
            const add = (d, extra) => { if (d && iso.test(d) && !map.has(d)) map.set(d, extra || {}); };
            add(rec.donationDate, { timesDonated: rec.timesDonated, amount: rec.amount });
            add(rec.lastDonation, {});
            (rec.transactions || []).forEach(t => add(t.date, { timesDonated: t.timesDonated, amount: t.amount }));
            const dates = Array.from(map.keys()).sort().reverse();
            if (dates.length > 0) rec.donationDate = dates[0];
            rec.lastDonation = dates[1] || 'N/A';
            const typedTimes = parseInt(rec.timesDonated, 10);
            const total = (!isNaN(typedTimes) && typedTimes >= 0) ? typedTimes : dates.length;
            const offset = Math.max(0, total - dates.length);
            const unit = unitLabel(rec.amount);
            const asc = dates.slice().reverse();
            const info = {};
            asc.forEach((d, i) => { info[d] = { timesDonated: String(offset + i + 1), amount: (map.get(d).amount && map.get(d).amount !== '') ? map.get(d).amount : unit }; });
            rec.transactions = dates.slice(1).reverse().map(d => ({ date: d, timesDonated: info[d].timesDonated, amount: info[d].amount }));
            if (dates.length > 0) { rec.timesDonated = String(total); }
            return dates.length;
        }
        function applyRecordDateEdit(r, nd, nl, nt, na) {
            r.donationDate = nd;
            if (nl) {
                r.lastDonation = nl;
                if (Array.isArray(r.transactions) && r.transactions.length > 0) r.transactions[r.transactions.length - 1].date = nl;
                else r.transactions = [{ date: nl, timesDonated: nt, amount: na }];
            }
            return recomputeRecordDates(r);
        }
        function localTodayISO() {
            const d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }

        function approveAndCommitHistoryRecord(btn) {
            if (isApprovingHistoryRecord) return;
            const actingUser = safeParseJSON('redflow_current_user');
            const adminActingName = (actingUser && actingUser.name) ? actingUser.name : 'Unknown';
            const actingUserName = historyRequestCreator || adminActingName;
            const donorId = document.getElementById('history_form_donorId').value;
            const name = document.getElementById('history_form_name').value;
            const location = document.getElementById('history_form_location').value;
            let bloodType = document.getElementById('history_form_bloodType').value;
            const donorForBloodTypeLock = donorsData.find(d => String(d.id) === String(donorId));
            let priorLastDonation = '';
            const priorLastDonationInput = priorLastDonation;
            if (!priorLastDonation && document.getElementById('history_form_newDonation').value && document.getElementById('history_form_donorId').value) {
                const dd = donorsData.find(x => String(x.id) === String(document.getElementById('history_form_donorId').value));
                if (dd && /^\d{4}-\d{2}-\d{2}$/.test(dd.lastDonation || '')) priorLastDonation = dd.lastDonation;
            }
            let newDonation = document.getElementById('history_form_newDonation').value;
            const timesDonated = document.getElementById('history_form_times').value.trim();
            const amount = document.getElementById('history_form_amount').value.trim();
            const pendingReqId = document.getElementById('history_form_pendingReqId').value;

            const timesDonatedNum = parseInt(timesDonated, 10);
            const amountNum = parseFloat(amount);
            const yearErr = donationDateError(newDonation, 'New Donation');
            if (yearErr) { showAlertBox(yearErr); return; }
            if (!newDonation) {
                showAlertBox('Please enter the New Donation date before continuing.');
                return;
            }
            if (timesDonated === '' || amount === '' || isNaN(timesDonatedNum) || timesDonatedNum < 0 || isNaN(amountNum) || amountNum <= 0) {
                showAlertBox('Cannot proceed: Times Donated / Amount cannot be blank or zero.');
                return;
            }
            isApprovingHistoryRecord = true;
            const btnOriginal = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
            }
            let existingIndex = monitoringRecords.findIndex(r => donorId && String(r.donorId) === String(donorId));
            if (existingIndex === -1) {
                existingIndex = monitoringRecords.findIndex(r => r.name.trim().toLowerCase() === name.trim().toLowerCase());
            }

            if (existingIndex !== -1) {
                const existingRecord = monitoringRecords[existingIndex];
                if (!Array.isArray(existingRecord.transactions)) existingRecord.transactions = [];
                const previousDonationDate = existingRecord.donationDate || priorLastDonation;
                if (previousDonationDate && previousDonationDate !== 'N/A') {
                    existingRecord.transactions.push({ date: previousDonationDate, timesDonated: existingRecord.timesDonated, amount: existingRecord.amount });
                }
                if (priorLastDonationInput && /^\d{4}-\d{2}-\d{2}$/.test(priorLastDonationInput)) {
                    existingRecord.transactions.push({ date: priorLastDonationInput, timesDonated: '', amount: amount });
                }
                existingRecord.donorId = donorId || existingRecord.donorId || null;
                existingRecord.location = location;
                existingRecord.bloodType = bloodType;
                existingRecord.lastDonation = previousDonationDate;
                existingRecord.donationDate = newDonation;
                existingRecord.timesDonated = timesDonated;
                existingRecord.amount = amount;
                if (!existingRecord.createdBy) existingRecord.createdBy = actingUserName;
                if (!existingRecord.createdAt) existingRecord.createdAt = historyRequestCreatedAt || new Date().toISOString();
                existingRecord.lastEditedBy = actingUserName;
                existingRecord.status = 'Approved';
                existingRecord.approvedBy = adminActingName;
                if (pendingReqId) existingRecord.pendingDonorRequestId = pendingReqId;
                recomputeRecordDates(existingRecord);
            } else {
                const initialTransactions = [];
                if (priorLastDonation && priorLastDonation !== 'N/A') {
                    initialTransactions.push({ date: priorLastDonation, timesDonated: '', amount: amount });
                }
                const newRecord = {
                    id: Date.now(),
                    donorId: donorId || null,
                    name: name,
                    location: location,
                    bloodType: bloodType,
                    timesDonated: timesDonated,
                    donationDate: newDonation,
                    lastDonation: priorLastDonation,
                    amount: amount,
                    transactions: initialTransactions,
                    createdBy: actingUserName,
                    createdAt: historyRequestCreatedAt || new Date().toISOString(),
                    lastEditedBy: actingUserName,
                    status: 'Approved',
                    approvedBy: adminActingName
                };
                if (pendingReqId) newRecord.pendingDonorRequestId = pendingReqId;
                recomputeRecordDates(newRecord);
                monitoringRecords.push(newRecord);
            }
            localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));
            const savedRecord = existingIndex !== -1 ? monitoringRecords[existingIndex] : monitoringRecords[monitoringRecords.length - 1];

            let donorIndex = donorsData.findIndex(d => String(d.id) === String(donorId));
            if (donorIndex === -1) {
                donorIndex = donorsData.findIndex(d => d.name.trim().toLowerCase() === name.trim().toLowerCase());
            }
            if (donorIndex !== -1) {
                donorsData[donorIndex].lastDonation = savedRecord.donationDate || newDonation;
                donorsData[donorIndex].timesDonated = savedRecord.timesDonated || timesDonated;
                localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                renderDonorCards();
                apiRequest('/api/donors/' + donorsData[donorIndex].id, 'PUT', donorsData[donorIndex]).catch(() => {});
            }

            renderMonitoringTable();
            updateStatisticsData();

            const endApprovingState = () => {
                isApprovingHistoryRecord = false;
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '';
                    btn.style.cursor = '';
                    btn.innerHTML = btnOriginal;
                }
            };

            apiRequest('/api/donation-records', 'POST', savedRecord).then(data => {
                if (data && data.record) {
                    const idx = monitoringRecords.findIndex(r => r.id === savedRecord.id);
                    if (idx !== -1) {
                        monitoringRecords[idx] = data.record;
                        localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));
                        renderMonitoringTable();
                    }
                }
                endApprovingState();
                if (pendingHistoryRequestId) {
                    const rid = pendingHistoryRequestId;
                    pendingHistoryRequestId = null; historyRequestCreator = null; historyRequestCreatedAt = null;
                    apiRequest('/admin/edit-requests/' + rid + '/approve', 'PATCH').then(() => loadEditRequests()).catch(() => {});
                }
                showAlertBox('Donor History Record created successfully! You can find it in Record.');
                switchMainPage('history', document.querySelectorAll('.bottom-nav-item')[2]);
            }).catch(err => {
                endApprovingState();
                pendingHistoryRequestId = null; historyRequestCreator = null; historyRequestCreatedAt = null;
                showAlertBox(err.isNetworkError
                    ? 'No internet connection. The record was saved on this device only and will need to be re-added once you are back online.'
                    : 'Warning: Could not save this record to the shared database (' + (err.message || 'unknown error') + "). It is only saved on this device for now.");
                switchMainPage('history', document.querySelectorAll('.bottom-nav-item')[2]);
            });
        }

        let selectedDonorIds = new Set();
        let currentRenderedDonorIds = [];

        function pendingDonorRequests() {
            const q = ((document.getElementById('donor-search-input') || { value: '' }).value || '').toLowerCase().trim();
            return editRequests.filter(r => r.type === 'donor_create' && r.status === 'Pending').filter(r => {
                const p = r.payload || {};
                const name = String(p.name || r.donorName || '').toLowerCase();
                const okQ = !q || name.includes(q) || String(p.brgy || '').toLowerCase().includes(q) || String(p.bloodType || '').toLowerCase().includes(q);
                const okAbo = currentAboFilter === 'All' || p.bloodType === currentAboFilter;
                const okBrgy = currentBrgyFilter === 'All Brgys.' || p.brgy === currentBrgyFilter;
                return okQ && okAbo && okBrgy;
            });
        }
        let pendingDonorSig = '';
        function syncPendingDonorCards() {
            const sig = editRequests.filter(r => r.type === 'donor_create' && r.status === 'Pending').map(r => r.id).join(',');
            if (sig === pendingDonorSig) return;
            pendingDonorSig = sig;
            if (document.getElementById('donor-cards-wrapper')) filterDonorsList();
        }
        function pendingDonorCardHtml(r) {
            const p = r.payload || {};
            const sex = p.sex || p.gender;
            return `
                <div class="donor-avatar-area"><div class="avatar-circle"><img src="${esc(p.avatar && !/picture\.jpg$/.test(p.avatar) ? p.avatar : defaultAvatarForSex(sex))}" alt="Donor" onerror="this.onerror=null;this.src='${defaultAvatarForSex(sex)}'"></div></div>
                <div class="donor-details-area">
                    <h4 class="donor-name-title">${esc(p.name || r.donorName)}</h4>
                    <div class="donor-meta-tags">
                        <span class="badge-abo">${esc(p.bloodType || '?')}</span>
                        <span class="badge-brgy">${esc((p.brgy || 'N/A') + ', Irosin, Sorsogon, Bicol, Philippines')}</span>
                    </div>
                    <p class="last-donated-text">Venue: <strong>${esc(p.venue || 'N/A')}</strong> | Submitted by: <strong>${esc(r.requestedBy || 'Staff')}</strong>${r.createdAt ? ' | Created: <strong>' + esc(formatLoginTimestamp(r.createdAt)) + '</strong>' : ''}</p>
                </div>
                <div class="donor-action-buttons pending-actions">
                    <span class="eligibility-badge pending-badge">PENDING</span>
                    <button class="action-btn-custom request-btn" onclick="openRequestView(${esc(r.id)}, true)">VIEW</button>
                    <button class="action-btn-custom request-btn" title="Create Donor History Record" onclick="openCreateHistoryFromPending(${esc(r.id)})">CREATE</button>
                    ${isInventoryUser() ? `<button class="req-btn view" onclick="goToDonorScreening()"><i class="fa-solid fa-user-check"></i> Screening</button>` : ''}
                </div>`;
        }
        function renderDonorCards(filteredList = null) {
            const wrapper = document.getElementById('donor-cards-wrapper');
            wrapper.innerHTML = '';
            const listToRender = filteredList || donorsData;
            const adminMode = isAdminUser();

            const countLabel = document.getElementById('donor-count-label');
            if (countLabel) {
                const pendingCount = pendingDonorRequests().length;
                countLabel.innerText = `${listToRender.length} Donors List` + (pendingCount ? ` • ${pendingCount} Pending` : '');
            }

            currentRenderedDonorIds = listToRender.map(d => d.id);
            selectedDonorIds.clear();
            refreshDonorDeleteBtn();
            const bulkBar = document.getElementById('donorBulkBar');
            if (bulkBar) bulkBar.style.display = adminMode ? 'flex' : 'none';
            const selectAllBox = document.getElementById('donorSelectAll');
            if (selectAllBox) selectAllBox.checked = false;

            const pendingList = pendingDonorRequests();
            if (listToRender.length === 0 && pendingList.length === 0) {
                wrapper.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No donors found.</div>`;
                return;
            }
            pendingList.forEach(r => {
                const pc = document.createElement('div');
                pc.className = 'donor-card-item pending-donor';
                pc.innerHTML = pendingDonorCardHtml(r);
                wrapper.appendChild(pc);
            });
            listToRender.forEach(donor => {
                const card = document.createElement('div');
                card.className = 'donor-card-item';
                card.setAttribute('data-abo', donor.bloodType);
                card.setAttribute('data-brgy', donor.brgy);
                card.setAttribute('data-name', donor.name);
                const fullLocationText = `${donor.brgy}, Irosin, Sorsogon, Bicol, Philippines`;
                const lastDonationDate = donor.lastDonation || 'N/A';
                const recForCard = monitoringRecords.find(r => (r.donorId && String(r.donorId) === String(donor.id)) || (!r.donorId && r.name && donor.name && r.name.trim().toLowerCase() === donor.name.trim().toLowerCase()));
                let timesDonatedCount;
                if (recForCard) {
                    const dateSet = new Set([recForCard.donationDate, recForCard.lastDonation].concat((recForCard.transactions || []).map(t => t.date)).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || '')));
                    const typed = parseInt(recForCard.timesDonated, 10);
                    timesDonatedCount = String((!isNaN(typed) && typed >= 0) ? typed : (dateSet.size || 1));
                } else {
                    timesDonatedCount = (donor.timesDonated === undefined || donor.timesDonated === null || donor.timesDonated === '') ? '1' : donor.timesDonated;
                }
                card.innerHTML = `
                    ${adminMode ? `<input type="checkbox" class="admin-row-checkbox" onchange="toggleDonorSelect(${esc(donor.id)}, this.checked)">` : ''}
                    <div class="donor-avatar-area">
                        <div class="avatar-circle">
                            <img src="${esc(donorAvatarSrc(donor))}" alt="Donor" onerror="this.onerror=null;this.src='${defaultAvatarForSex(donor.sex || donor.gender)}'">
                        </div>
                    </div>
                    <div class="donor-details-area">
                        <h4 class="donor-name-title">${esc(donor.name)}</h4>
                        <div class="donor-meta-tags">
                            <span class="badge-abo">${esc(donor.bloodType)}</span>
                            <span class="badge-brgy">${esc(fullLocationText)}</span>
                        </div>
                        <p class="last-donated-text">New Donation: <strong>${esc(fmtMDY(lastDonationDate))}</strong> | Times Donated: <strong>${esc(timesDonatedCount)}</strong></p>
                    </div>
                    <div class="donor-action-buttons">
                        <span class="eligibility-badge eligibility-${eligibilityClass(donor.eligibilityStatus)}">${esc(normalizeEligibility(donor.eligibilityStatus) || 'Eligible')}</span>
                        <button class="action-btn-custom request-btn" onclick="openDonorProfile(${esc(JSON.stringify(donor))})">VIEW</button>
                        <button class="action-btn-custom request-btn" title="Create Donor History Record" onclick="openCreateHistoryForm(${esc(donor.id)})">CREATE</button>
                    </div>
                `;
                wrapper.appendChild(card);
            });
        }

        function toggleDonorSelect(id, checked) {
            if (checked) selectedDonorIds.add(id); else selectedDonorIds.delete(id);
            refreshDonorDeleteBtn();
        }

        function refreshDonorDeleteBtn() {
            const btn = document.getElementById('donorDeleteBtn');
            if (!btn) return;
            btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selectedDonorIds.size})`;
            btn.classList.toggle('active', selectedDonorIds.size > 0);
        }

        function toggleSelectAllDonors(checked) {
            document.querySelectorAll('#donor-cards-wrapper .admin-row-checkbox').forEach(cb => cb.checked = checked);
            if (checked) currentRenderedDonorIds.forEach(id => selectedDonorIds.add(id));
            else selectedDonorIds.clear();
            refreshDonorDeleteBtn();
        }

        function deleteSelectedDonors() {
            if (selectedDonorIds.size === 0) return;
            showConfirmBox(`Are you sure you want to delete ${selectedDonorIds.size} selected donor(s)?`, () => {
                const idsToDelete = Array.from(selectedDonorIds);
                return apiRequest('/api/donors', 'DELETE', { ids: idsToDelete }).then(() => {
                    donorsData = donorsData.filter(d => !selectedDonorIds.has(d.id));
                    localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                    selectedDonorIds.clear();
                    renderDonorCards();
                    updateStatisticsData();
                    showAlertBox('Selected donors were deleted successfully.');
                }).catch(err => {
                    showAlertBox(err.isNetworkError ? 'No internet connection. Please check your connection and try again.' : (err.message || 'Could not delete these donors from the database. Please try again.'));
                });
            }, 'Delete Donors');
        }

        let selectedRecordIds = new Set();
        let currentRenderedRecordIds = [];

        function renderMonitoringTable(filteredList = monitoringRecords) {
            const container = document.getElementById('monitoring-table-container');
            container.innerHTML = '';
            const adminMode = isAdminUser();

            currentRenderedRecordIds = filteredList.map(r => r.id);
            selectedRecordIds.clear();
            refreshHistoryDeleteBtn();
            const bulkBar = document.getElementById('historyBulkBar');
            if (bulkBar) bulkBar.style.display = adminMode ? 'flex' : 'none';
            const selectAllBox = document.getElementById('historySelectAll');
            if (selectAllBox) selectAllBox.checked = false;

            const pendingHist = getPendingHistoryRequests();
            pendingHist.forEach(req => {
                const p = req.payload || {};
                const pcard = document.createElement('div');
                pcard.style.cssText = "background:var(--card-bg); border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid var(--border-color); border-left:4px solid var(--warning-orange); display:flex; justify-content:space-between; align-items:center; cursor:pointer;";
                pcard.onclick = () => openRequestView(req.id, true);
                pcard.innerHTML = `
                    <div>
                        <div style="font-size:18px; font-weight:bold; color:var(--text-dark); margin-bottom:5px;">${esc(p.name || req.donorName)}</div>
                        <div style="font-size:14px; color:var(--text-muted); margin-bottom:4px;">Times Donated: ${esc(p.timesDonated || '1')}</div>
                        <div style="font-size:14px; color:var(--text-muted);">${esc(fmtMDY(p.newDonation || ''))} • submitted by ${esc(req.requestedBy || 'Staff')}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        ${recordStatusChip('Pending')}
                        <span style="background:var(--primary-red); color:white; padding:6px 14px; border-radius:6px; font-weight:bold; font-size:15px;">${esc(p.bloodType || '')}</span>
                        <i class="fa-solid fa-chevron-right" style="color:var(--text-muted); font-size:18px;"></i>
                    </div>`;
                container.appendChild(pcard);
            });
            if (filteredList.length === 0) {
                if (pendingHist.length === 0) container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No records found.</div>`;
                return;
            }
            filteredList.forEach((record) => {
                const originalIndex = monitoringRecords.findIndex(r => r.id === record.id);
                const card = document.createElement('div');
                card.style.cssText = "background:var(--card-bg); border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; cursor:pointer;";
                card.onclick = () => openRecordDetail(originalIndex);
                card.innerHTML = `
                    <div style="display:flex; align-items:center;">
                        ${adminMode ? `<input type="checkbox" class="admin-row-checkbox" onclick="event.stopPropagation();" onchange="toggleRecordSelect(${esc(record.id)}, this.checked)">` : ''}
                        <div>
                            <div style="font-size:18px; font-weight:bold; color:var(--text-dark); margin-bottom:5px;">${esc(record.name)}</div>
                            <div style="font-size:14px; color:var(--text-muted); margin-bottom:4px;">Times Donated: ${esc(record.timesDonated || '1')}</div>
                            <div style="font-size:14px; color:var(--text-muted);">${esc(fmtMDY(record.donationDate || ''))}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        ${recordStatusChip(record.status)}
                        <span style="background:var(--primary-red); color:white; padding:6px 14px; border-radius:6px; font-weight:bold; font-size:15px;">${esc(record.bloodType)}</span>
                        <i class="fa-solid fa-chevron-right" style="color:var(--text-muted); font-size:18px;"></i>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    function toggleRecordSelect(id, checked) {
            if (checked) selectedRecordIds.add(id); else selectedRecordIds.delete(id);
            refreshHistoryDeleteBtn();
        }

        function refreshHistoryDeleteBtn() {
            const btn = document.getElementById('historyDeleteBtn');
            if (!btn) return;
            btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selectedRecordIds.size})`;
            btn.classList.toggle('active', selectedRecordIds.size > 0);
        }

        function toggleSelectAllRecords(checked) {
            document.querySelectorAll('#monitoring-table-container .admin-row-checkbox').forEach(cb => cb.checked = checked);
            if (checked) currentRenderedRecordIds.forEach(id => selectedRecordIds.add(id));
            else selectedRecordIds.clear();
            refreshHistoryDeleteBtn();
        }

        function deleteSelectedRecords() {
            if (selectedRecordIds.size === 0) return;
            showConfirmBox(`Are you sure you want to delete ${selectedRecordIds.size} selected history record(s)?`, () => {
                const idsToDelete = Array.from(selectedRecordIds);
                return apiRequest('/api/donation-records', 'DELETE', { ids: idsToDelete }).then(() => {
                    const goneRecs = monitoringRecords.filter(r => selectedRecordIds.has(r.id));
                    monitoringRecords = monitoringRecords.filter(r => !selectedRecordIds.has(r.id));
                    const sameDonor = (d, r) => (r.donorId && String(r.donorId) === String(d.id)) || (!r.donorId && r.name && d.name && r.name.trim().toLowerCase() === d.name.trim().toLowerCase());
                    donorsData.forEach(d => {
                        if (goneRecs.some(r => sameDonor(d, r)) && !monitoringRecords.some(r => sameDonor(d, r))) {
                            d.lastDonation = 'N/A';
                            d.timesDonated = 0;
                            if (isAdminUser()) apiRequest('/api/donors/' + d.id, 'PUT', { lastDonation: 'N/A', timesDonated: 0 }).catch(() => {});
                        }
                    });
                    localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                    renderDonorCards();
                    localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));
                    selectedRecordIds.clear();
                    renderMonitoringTable();
                    updateStatisticsData();
                    showAlertBox('Selected records were deleted successfully.');
                }).catch(err => {
                    showAlertBox(err.isNetworkError ? 'No internet connection. Please check your connection and try again.' : (err.message || 'Could not delete these records from the database. Please try again.'));
                });
            }, 'Delete Records');
        }

        function filterHistoryRecords() {
            const query = document.getElementById('history-search-input').value.toLowerCase();
            const filtered = monitoringRecords.filter(rec => 
                rec.name.toLowerCase().includes(query) || rec.bloodType.toLowerCase().includes(query)
            );
            renderMonitoringTable(filtered);
        }
        const debouncedFilterHistoryRecords = debounce(filterHistoryRecords, 250);

        function formatDateLong(dateStr) {
            if (!dateStr || dateStr === 'N/A') return 'N/A';
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr));
            if (!m) return dateStr;
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const mi = parseInt(m[2], 10) - 1, day = parseInt(m[3], 10);
            if (mi < 0 || mi > 11 || day < 1 || day > 31) return dateStr;
            return m[2] + '-' + m[3] + '-' + m[1];
        }
        function donationDateError(iso, label) {
            if (!iso) return '';
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
            const y = m ? parseInt(m[1], 10) : NaN;
            if (isNaN(y) || y < 1900) return `${label}: please enter a complete 4-digit year (for example 2005).`;
            if (iso > localTodayISO()) return `${label}: the date cannot be in the future.`;
            return '';
        }
        function validateDonationDateField(el, label) {
            const err = donationDateError(el.value, label);
            if (err) { showAlertBox(err); el.value = ''; }
        }

        let currentOpenRecordIndex = null;

        function openRecordDetail(index) {
            currentOpenRecordIndex = index;
            const rec = monitoringRecords[index];
            document.getElementById('detail_name').innerText = rec.name;
            document.getElementById('detail_location').innerText = rec.location || 'N/A';
            document.getElementById('detail_bloodType').innerText = rec.bloodType;
            setRecordDateLines(rec);
            document.getElementById('detail_timesDonated').innerText = rec.timesDonated || '1';
            document.getElementById('detail_amount').innerText = unitLabel(rec.amount);
            document.getElementById('detail_createdBy').innerText = rec.createdBy || 'Unknown';
            document.getElementById('detail_createdAt').innerText = rec.createdAt ? formatLoginTimestamp(rec.createdAt) : 'N/A';
            const stEl = document.getElementById('detail_status');
            if (stEl) stEl.innerHTML = recordStatusChip(rec.status || 'Approved') + (rec.approvedBy ? ` <span style="font-size:12px; color:var(--text-muted);">by ${esc(rec.approvedBy)}</span>` : '');
            const editBtn = document.getElementById('recordEditBtn');
            if (editBtn) editBtn.style.display = isAdminUser() ? 'block' : 'none';

            renderLastDonationTransactionList(rec);
            cancelRecordEditMode();
            switchMainPage('single-record', null);
        }

        function txMetaText(tx, ordinal, rec) {
            const times = (tx && tx.timesDonated !== undefined && tx.timesDonated !== null && String(tx.timesDonated) !== '') ? tx.timesDonated : ordinal;
            const unit = unitLabel((tx && tx.amount) ? tx.amount : (rec && rec.amount));
            return `${times} time(s) • ${unit}`;
        }
        function setRecordDateLines(rec) {
            const n = document.getElementById('detail_newDonation');
            const l = document.getElementById('detail_lastDonation');
            if (n) n.textContent = formatDateLong(rec.donationDate);
            if (l) l.textContent = formatDateLong(rec.lastDonation);
        }
        function renderLastDonationTransactionList(rec) {
            const txContainer = document.getElementById('lastDonationTransactionList');
            if (!txContainer) return;
            const transactions = Array.isArray(rec.transactions) ? rec.transactions.slice().reverse() : [];
            if (transactions.length === 0) {
                txContainer.innerHTML = '<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:14px;">No prior donation transactions yet.</div>';
            } else {
                const ascLen = transactions.length;
                txContainer.innerHTML = transactions.map((tx, i) => {
                    const meta = txMetaText(tx, ascLen - i, rec);
                    return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid var(--border-color);">
                        <div style="font-size:15px; color:var(--text-dark);"><span style="font-weight:bold;">Last Donation:</span> ${formatDateLong(tx.date)}</div>
                        <div style="font-size:13px; color:var(--text-muted);">${esc(meta)}</div>
                    </div>`;
                }).join('');
            }
        }

        function enterRecordEditMode() {
            if (!isAdminUser()) { showAlertBox('Only the Administrator can edit a record.'); return; }
            if (currentOpenRecordIndex === null) return;
            const rec = monitoringRecords[currentOpenRecordIndex];

            document.getElementById('detail_name_edit').value = rec.name || '';
            document.getElementById('detail_location_edit').value = rec.location || '';
            document.getElementById('detail_bloodType_edit').value = rec.bloodType || 'O+';
            document.getElementById('detail_newDonation_edit').value = rec.donationDate || '';
            document.getElementById('detail_lastDonation_edit').value = (rec.lastDonation && rec.lastDonation !== 'N/A') ? rec.lastDonation : '';
            document.getElementById('detail_timesDonated_edit').value = rec.timesDonated || '1';
            document.getElementById('detail_amount_edit').value = unitLabel(rec.amount);

            const bloodTypeLocked = false;
            const bloodTypeSelect = document.getElementById('detail_bloodType_edit');
            bloodTypeSelect.disabled = bloodTypeLocked;
            const bloodTypeLockNote = document.getElementById('detail_bloodType_lock_note');
            if (bloodTypeLockNote) bloodTypeLockNote.style.display = bloodTypeLocked ? 'block' : 'none';

            ['name','location','bloodType','newDonation','lastDonation','timesDonated','amount'].forEach(f => {
                document.getElementById('detail_' + f).style.display = 'none';
                document.getElementById('detail_' + f + '_edit').style.display = 'block';
            });
            document.getElementById('recordViewButtons').style.display = 'none';
            document.getElementById('recordEditButtons').style.display = 'flex';
        }

        function cancelRecordEditMode() {
            ['name','location','bloodType','newDonation','lastDonation','timesDonated','amount'].forEach(f => {
                const viewEl = document.getElementById('detail_' + f);
                const editEl = document.getElementById('detail_' + f + '_edit');
                if (viewEl) viewEl.style.display = 'block';
                if (editEl) editEl.style.display = 'none';
            });
            const bloodTypeLockNote = document.getElementById('detail_bloodType_lock_note');
            if (bloodTypeLockNote) bloodTypeLockNote.style.display = 'none';
            const vb = document.getElementById('recordViewButtons');
            const eb = document.getElementById('recordEditButtons');
            if (vb) vb.style.display = 'block';
            if (eb) eb.style.display = 'none';
        }

        function saveRecordEdit() {
            if (currentOpenRecordIndex === null) return;
            const rec = monitoringRecords[currentOpenRecordIndex];

            const newName = document.getElementById('detail_name_edit').value.trim();
            const newLocation = document.getElementById('detail_location_edit').value.trim();
            let newBloodType = document.getElementById('detail_bloodType_edit').value;
            const newDonationDate = document.getElementById('detail_newDonation_edit').value;
            const newLastDonationDate = document.getElementById('detail_lastDonation_edit').value;
            const editYearErr = donationDateError(newDonationDate, 'New Donation') || donationDateError(newLastDonationDate, 'Last Donation');
            if (editYearErr) { showAlertBox(editYearErr); return; }
            let newTimesDonated = document.getElementById('detail_timesDonated_edit').value.trim();
            const newAmount = document.getElementById('detail_amount_edit').value.trim();

            if (rec.bloodType && !isAdminUser() && newBloodType !== rec.bloodType) {
                newBloodType = rec.bloodType;
            }

            if (!newName || !newTimesDonated || !newAmount) {
                showAlertBox('Cannot save: Name, Times Donated, and Amount cannot be blank.');
                return;
            }

            if (isNaN(parseInt(newTimesDonated, 10)) || parseInt(newTimesDonated, 10) < 0) {
                showAlertBox('Times Donated must be a number.');
                return;
            }
            newTimesDonated = String(parseInt(newTimesDonated, 10));

            const oldName = rec.name;
            const oldLocation = rec.location;
            const oldBloodType = rec.bloodType;
            const oldTimesDonated = rec.timesDonated;
            const oldAmount = unitLabel(rec.amount);
            const oldLastDonation = rec.lastDonation;
            const oldDonationDate = rec.donationDate;
            rec.name = newName;
            rec.location = newLocation;
            rec.bloodType = newBloodType;
            rec.donationDate = newDonationDate;
            rec.timesDonated = newTimesDonated;
            rec.amount = newAmount;

            applyRecordDateEdit(rec, newDonationDate, newLastDonationDate, newTimesDonated, newAmount);

            const actingUser = safeParseJSON('redflow_current_user');
            rec.lastEditedBy = (actingUser && actingUser.name) ? actingUser.name : rec.lastEditedBy || 'Unknown';
            if (!rec.createdBy) rec.createdBy = rec.lastEditedBy;

            const recordChangeParts = [];
            if (oldName !== rec.name) recordChangeParts.push(`Name: ${oldName} > ${rec.name}`);
            if (oldLocation !== rec.location) recordChangeParts.push(`Location: ${oldLocation} > ${rec.location}`);
            if (oldBloodType !== rec.bloodType) recordChangeParts.push(`Blood Type: ${oldBloodType} > ${rec.bloodType}`);
            if (oldTimesDonated !== rec.timesDonated) recordChangeParts.push(`Times Donated: ${oldTimesDonated} > ${rec.timesDonated}`);
            if (oldAmount !== rec.amount) recordChangeParts.push(`Amount: ${oldAmount} > ${rec.amount}`);
            if (oldDonationDate !== rec.donationDate) recordChangeParts.push(`New Donation: ${fmtMDY(oldDonationDate)} > ${fmtMDY(rec.donationDate)}`);
            if (oldLastDonation !== rec.lastDonation) recordChangeParts.push(`Last Donation: ${fmtMDY(oldLastDonation)} > ${fmtMDY(rec.lastDonation)}`);
            if (recordChangeParts.length > 0) {
                logAuditEvent('Update', { id: rec.donorId || rec.id, name: rec.name }, formatChangeParts(recordChangeParts));
            }

            localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));

            if (rec.donorId) {
                const donorIndex = donorsData.findIndex(d => String(d.id) === String(rec.donorId));
                if (donorIndex !== -1) {
                    donorsData[donorIndex].name = newName;
                    donorsData[donorIndex].location = newLocation;
                    donorsData[donorIndex].bloodType = newBloodType;
                    donorsData[donorIndex].timesDonated = rec.timesDonated;
                    if (newLastDonationDate) donorsData[donorIndex].lastDonation = newLastDonationDate;
                    localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                    renderDonorCards();
                }
            } else if (oldName) {
                const donorIndex = donorsData.findIndex(d => d.name.trim().toLowerCase() === oldName.trim().toLowerCase());
                if (donorIndex !== -1) {
                    donorsData[donorIndex].name = newName;
                    donorsData[donorIndex].location = newLocation;
                    donorsData[donorIndex].bloodType = newBloodType;
                    donorsData[donorIndex].timesDonated = rec.timesDonated;
                    if (newLastDonationDate) donorsData[donorIndex].lastDonation = newLastDonationDate;
                    localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                    renderDonorCards();
                }
            }

            document.getElementById('detail_name').innerText = rec.name;
            document.getElementById('detail_location').innerText = rec.location || 'N/A';
            document.getElementById('detail_bloodType').innerText = rec.bloodType;
            setRecordDateLines(rec);
            document.getElementById('detail_timesDonated').innerText = rec.timesDonated;
            document.getElementById('detail_amount').innerText = rec.amount;
            document.getElementById('detail_createdBy').innerText = rec.createdBy || 'Unknown';
            document.getElementById('detail_createdAt').innerText = rec.createdAt ? formatLoginTimestamp(rec.createdAt) : 'N/A';
            renderLastDonationTransactionList(rec);
            renderMonitoringTable();
            updateStatisticsData();

            const endSavingState = () => {};

            cancelRecordEditMode();
            showAlertBox(recordChangeParts.length ? 'Change: ' + recordChangeParts.join('\nChange: ') : 'No changes were made.');
            apiRequest('/api/donation-records', 'POST', { ...rec, _directEdit: true, _auditDetails: formatChangeParts(recordChangeParts) }).then(data => {
                if (data && data.record) {
                    const idx = monitoringRecords.findIndex(r => r.id === rec.id);
                    if (idx !== -1) {
                        monitoringRecords[idx] = data.record;
                        localStorage.setItem('redflow_monitoring_records', JSON.stringify(monitoringRecords));
                    }
                }
            }).catch(err => {
                showAlertBox(err.isNetworkError
                    ? 'No internet connection. This edit was saved on this device only and will need to be re-saved once you are back online.'
                    : 'Warning: Could not save this edit to the shared database (' + (err.message || 'unknown error') + "). It is only saved on this device for now.");
            });
            if (rec.donorId) {
                const brgyOnlyForDonorSync = newLocation.split(',')[0].trim();
                apiRequest('/api/donors/' + rec.donorId, 'PUT', { name: rec.name, bloodType: rec.bloodType, brgy: brgyOnlyForDonorSync, lastDonation: rec.donationDate || rec.lastDonation, timesDonated: rec.timesDonated }).catch(() => {});
            }
        }
  
        function goToWizardStep(stepNum) {
            const wb = document.getElementById('w_bday');
            if (wb) wb.max = maxAdultBirthdateISO();
            document.getElementById('wizard-step-0').style.display = 'none';
            document.getElementById('wizard-step-1').style.display = 'none';
            document.getElementById('wizard-step-2').style.display = 'none';
            document.getElementById('wizard-step-3').style.display = 'none';
            document.getElementById('wizard-step-4').style.display = 'none';
            if (stepNum === 0) {
                document.getElementById('wizard-step-0').style.display = 'block';
            } else if (stepNum === 1) {
                document.getElementById('wizard-step-1').style.display = 'block';
            } else if (stepNum === 2) {
                document.getElementById('wizard-step-2').style.display = 'block';
            } else if (stepNum === 3) {
                document.getElementById('wizard-step-3').style.display = 'block';
            } else if (stepNum === 4) {
                document.getElementById('wizard-step-4').style.display = 'block';
                populateReviewStep();
            }
        }

        function validateStep1AndProceed() {
            const fName = document.getElementById('w_firstName').value.trim();
            const lName = document.getElementById('w_lastName').value.trim();
            const bday = document.getElementById('w_bday').value;
            const sex = document.getElementById('w_sex').value;
            const bloodType = document.getElementById('w_bloodType').value;
            const role = 'Donor';
            const noMiddleChecked = !!(document.getElementById('w_noMiddle') || {}).checked;
            const midName = document.getElementById('w_middleName').value.trim();
            if (!noMiddleChecked && !midName) {
                showAlertBox('Please enter the Middle Name, or tick "I have no Middle Name" to continue.');
                return;
            }
            if (!fName || !lName || !bday || !sex || !isValidPh10('w_contact') && !document.getElementById('w_contact').value.trim() || !bloodType || !role) {
                showAlertBox(REQUIRED_MSG);
                return;
            }
            const bErr = birthdateError(bday, 'donors');
            if (bErr) { showAlertBox(bErr); return; }
            if (!isValidPh10('w_contact')) {
                showAlertBox('Please enter your complete contact number after +63 (e.g. 9171234567).');
                return;
            }
            document.getElementById('bloodTypeConfirmMessage').innerText = `You entered Blood Type: ${bloodType}. Are you sure this is correct?`;
            openModal('bloodTypeConfirmModal');
        }

        function confirmBloodTypeAndProceed() {
            closeModal('bloodTypeConfirmModal');
            goToWizardStep(2);
        }

        function validateLocationAndProceed() {
            const barangay = document.getElementById('w_barangay').value;
            const venueVal = (document.getElementById('w_venue') || { value: '' }).value.trim();
            if (!barangay || !venueVal) {
                showAlertBox(!barangay ? 'Please select the Barangay before continuing.' : 'Please enter the Venue before continuing.');
                return;
            }
            goToWizardStep(3);
        }

        function validateStep3AndProceed() {
            const weight = document.getElementById('w_weight').value.trim();
            const wBp = (document.getElementById('w_bp') || { value: '' }).value.trim();
            const wHeight = (document.getElementById('w_height') || { value: '' }).value.trim();
            const eligibility = getComboValue('w_eligibilityStatus');
            const emergencyName = document.getElementById('w_emergencyContactName').value.trim();
            const emergencyNumber = document.getElementById('w_emergencyContactNumber').value.trim();
            const eligSel = document.getElementById('w_eligibilityStatus');
            if (!weight || !wBp || !wHeight || !eligSel || !eligSel.value || !emergencyName || !emergencyNumber) {
                showAlertBox(REQUIRED_MSG);
                return;
            }
            const w = parseFloat(weight);
            if (isNaN(w) || w <= 0 || w > 300) {
                showAlertBox('Please enter a valid weight in kg (e.g. 55).');
                return;
            }
            const bpm = /^(\d{2,3})\/(\d{2,3})$/.exec(wBp);
            if (!bpm || +bpm[1] < 70 || +bpm[1] > 250 || +bpm[2] < 40 || +bpm[2] > 150) {
                showAlertBox('Please enter a valid Blood Pressure (e.g. 120/80).');
                return;
            }
            const hbRaw = (document.getElementById('w_hemoglobin') || { value: '' }).value.trim();
            if (hbRaw !== '' && hemoglobinError(hbRaw)) {
                showAlertBox(hemoglobinError(hbRaw));
                return;
            }
            const hv = parseFloat(wHeight);
            if (isNaN(hv) || hv < 50 || hv > 250) {
                showAlertBox('Please enter a valid height in cm (e.g. 165).');
                return;
            }
            if (!isValidPh10('w_emergencyContactNumber')) {
                showAlertBox('Please enter the complete Emergency Contact Number after +63.');
                return;
            }
            const emptyOther = firstEmptyOther([
                ['w_eligibilityStatus', 'Eligibility Status'], ['w_allergies', 'Known Allergies'],
                ['w_medicalConditions', 'Existing Medical Conditions'], ['w_deferralReason', 'Deferral / Screening Notes']
            ]);
            if (emptyOther) { alertSpecifyOther(emptyOther); return; }
            if (!eligibility) { showAlertBox(REQUIRED_MSG); return; }
            goToWizardStep(4);
        }

        function toggleMiddleName(checkbox) {
            const middleInput = document.getElementById('w_middleName');
            if (checkbox.checked) {
                middleInput.value = 'N/A';
                middleInput.disabled = true;
            } else {
                middleInput.value = '';
                middleInput.disabled = false;
            }
        }

        function populateReviewStep() {
            document.getElementById('rev_firstName').value = document.getElementById('w_firstName').value;
            document.getElementById('rev_middleName').value = document.getElementById('w_middleName').value.trim() || 'N/A';
            document.getElementById('rev_lastName').value = document.getElementById('w_lastName').value;
            document.getElementById('rev_ext').value = document.getElementById('w_ext').value.trim() || 'N/A';
            document.getElementById('rev_bloodType').value = document.getElementById('w_bloodType').value;
            document.getElementById('rev_bday').value = document.getElementById('w_bday').value;
            document.getElementById('rev_contact').value = phoneFull('w_contact');
            document.getElementById('rev_location').value = document.getElementById('w_barangay').value;
            document.getElementById('rev_venue').value = document.getElementById('w_venue').value.trim();
            document.getElementById('rev_weight').value = document.getElementById('w_weight').value.trim();
            document.getElementById('rev_bp').value = document.getElementById('w_bp').value.trim();
            document.getElementById('rev_height').value = document.getElementById('w_height').value.trim();
            document.getElementById('rev_hemoglobin').value = (document.getElementById('w_hemoglobin') || { value: '' }).value.trim();
            const dispVal = (id, none) => { const v = getComboValue(id); return (!v || v === 'None') ? (none || 'None') : v; };
            const revEl = document.getElementById('rev_eligibility');
            const eligVal = getComboValue('w_eligibilityStatus') || 'Eligible';
            if (!Array.from(revEl.options).some(o => o.value === eligVal)) revEl.insertAdjacentHTML('beforeend', `<option value="${esc(eligVal)}">${esc(eligVal)}</option>`);
            revEl.value = eligVal;
            document.getElementById('rev_allergies').value = dispVal('w_allergies');
            document.getElementById('rev_medical').value = dispVal('w_medicalConditions');
            document.getElementById('rev_deferral').value = dispVal('w_deferralReason');
            document.getElementById('rev_emName').value = document.getElementById('w_emergencyContactName').value.trim();
            document.getElementById('rev_emNumber').value = phoneFull('w_emergencyContactNumber');
            document.getElementById('rev_status').value = 'Pending (waiting for Approval)';
            const revSex = document.getElementById('rev_sex');
            if (revSex) revSex.value = document.getElementById('w_sex').value;
            wizardAvatarSex = '';
            renderWizardAvatarPicker();
        }

        let wizardAvatarSrc = '';
        let wizardAvatarSex = '';
        function renderWizardAvatarPicker() {
            const sex = (document.getElementById('rev_sex') || {}).value || document.getElementById('w_sex').value;
            const picker = document.getElementById('wizardAvatarPicker');
            const preview = document.getElementById('wizardAvatarPreview');
            if (!picker) return;
            if (sex !== wizardAvatarSex) {
                wizardAvatarSex = sex;
                if (!wizardAvatarSrc || wizardAvatarSrc.startsWith(AVATAR_DIR)) wizardAvatarSrc = defaultAvatarForSex(sex);
            }
            if (!wizardAvatarSrc) wizardAvatarSrc = defaultAvatarForSex(sex);
            picker.innerHTML = AVATAR_CHOICES.map(f => `<button type="button" class="avatar-choice ${wizardAvatarSrc === AVATAR_DIR + f ? 'selected' : ''}" onclick="chooseWizardAvatar('${f}')" title="${f.replace('.jpg','')}"><img src="${AVATAR_DIR + f}" alt="${f}"></button>`).join('');
            if (preview) preview.src = wizardAvatarSrc;
        }
        function onRevSexChange(v) {
            const w = document.getElementById('w_sex');
            if (w) w.value = v;
            wizardAvatarSex = '';
            renderWizardAvatarPicker();
        }
        function chooseWizardAvatar(file) {
            wizardAvatarSrc = AVATAR_DIR + file;
            renderWizardAvatarPicker();
        }

        function hemoglobinError(v) {
            const n = parseFloat(v);
            if (isNaN(n) || n < 5 || n > 25) return 'Please enter a valid Hemoglobin in g/dL (e.g. 13.5), or leave it empty.';
            return '';
        }
        function vitalsValidationError(weight, bp, height, hemoglobin) {
            if (hemoglobin && hemoglobinError(hemoglobin)) return hemoglobinError(hemoglobin);
            if (!weight || !bp || !height) return REQUIRED_MSG;
            const w = parseFloat(weight);
            if (isNaN(w) || w <= 0 || w > 300) return 'Please enter a valid weight in kg (e.g. 55).';
            const m = /^(\d{2,3})\/(\d{2,3})$/.exec(bp);
            if (!m || +m[1] < 70 || +m[1] > 250 || +m[2] < 40 || +m[2] > 150) return 'Please enter a valid Blood Pressure (e.g. 120/80).';
            const h = parseFloat(height);
            if (isNaN(h) || h < 50 || h > 250) return 'Please enter a valid height in cm (e.g. 165).';
            return '';
        }
        function cancelDonorWizard() {
            resetDonorWizardForm();
            goToWizardStep(0);
        }
        let isCreatingDonor = false;

        function commitNewDonor() {
            if (isCreatingDonor) return;
            isCreatingDonor = true;
            const createBtn = document.querySelector('#wizard-step-4 .action-main-btn');
            const createBtnOriginalText = createBtn ? createBtn.innerHTML : '';
            if (createBtn) {
                createBtn.disabled = true;
                createBtn.style.opacity = '0.6';
                createBtn.style.cursor = 'not-allowed';
                createBtn.innerHTML = 'Creating...';
            }

            const fName = document.getElementById('rev_firstName').value;
            let mName = document.getElementById('rev_middleName').value.trim();
            if (mName === "N/A") mName = "";
            const lName = document.getElementById('rev_lastName').value;
            let ext = document.getElementById('rev_ext').value.trim();
            if (ext.toUpperCase() === 'N/A') ext = '';
            const validMName = mName ? mName + ' ' : '';
            const validExt = ext ? ' ' + ext : '';
            const fullName = `${fName} ${validMName}${lName}${validExt}`;
            const bloodType = document.getElementById('rev_bloodType').value;
            const brgy = document.getElementById('rev_location').value;
            const venue = document.getElementById('rev_venue').value.trim();
            if (!venue) { isCreatingDonor = false; if (createBtn) { createBtn.disabled = false; createBtn.style.opacity = ''; createBtn.style.cursor = ''; createBtn.innerHTML = createBtnOriginalText; } showAlertBox(REQUIRED_MSG); return; }
            const contact = document.getElementById('rev_contact').value;
            const bday = document.getElementById('rev_bday').value;
            const revSexEl = document.getElementById('rev_sex');
            if (revSexEl && revSexEl.value) document.getElementById('w_sex').value = revSexEl.value;
            const sex = document.getElementById('w_sex').value;
            const avatarSrc = wizardAvatarSrc || defaultAvatarForSex(sex);
            const newDonorId = donorsData.length + 1;

            const wWeightField = document.getElementById('w_weight');
            const wEligibilityField = document.getElementById('w_eligibilityStatus');
            const wAllergiesField = document.getElementById('w_allergies');
            const wMedicalConditionsField = document.getElementById('w_medicalConditions');
            const wDeferralReasonField = document.getElementById('w_deferralReason');
            const wEmergencyNameField = document.getElementById('w_emergencyContactName');
            const wEmergencyNumberField = document.getElementById('w_emergencyContactNumber');

            const revWeightVal = (document.getElementById('rev_weight') || wWeightField || { value: '' }).value.trim();
            const revBpVal = (document.getElementById('rev_bp') || document.getElementById('w_bp') || { value: '' }).value.trim();
            const revHeightVal = (document.getElementById('rev_height') || document.getElementById('w_height') || { value: '' }).value.trim();
            const revHbVal = (document.getElementById('rev_hemoglobin') || document.getElementById('w_hemoglobin') || { value: '' }).value.trim();
            const vitalsError = vitalsValidationError(revWeightVal, revBpVal, revHeightVal, revHbVal);
            if (vitalsError) {
                isCreatingDonor = false;
                if (createBtn) { createBtn.disabled = false; createBtn.style.opacity = ''; createBtn.style.cursor = ''; createBtn.innerHTML = createBtnOriginalText; }
                showAlertBox(vitalsError);
                return;
            }
            const newWeight = revWeightVal;
            const newBp = revBpVal;
            const newHeight = revHeightVal;
            const revVal = (id, fallback) => { const el = document.getElementById(id); return el ? el.value.trim() : fallback; };
            const newEligibilityStatus = revVal('rev_eligibility', getComboValue('w_eligibilityStatus')) || 'Eligible';
            const newAllergies = revVal('rev_allergies', getComboValue('w_allergies')) || 'None';
            const newMedicalConditions = revVal('rev_medical', getComboValue('w_medicalConditions')) || 'None';
            const revDeferral = revVal('rev_deferral', getComboValue('w_deferralReason'));
            const newDeferralReason = (!revDeferral || revDeferral === 'None') ? '' : revDeferral;
            const newEmergencyContactName = revVal('rev_emName', wEmergencyNameField ? wEmergencyNameField.value.trim() : '');
            const emDigits = revVal('rev_emNumber', phoneFull('w_emergencyContactNumber')).replace(/\D/g, '');
            let newEmergencyContactNumber = '';
            if (emDigits.length === 12 && emDigits.startsWith('63')) newEmergencyContactNumber = '+' + emDigits;
            else if (emDigits.length === 11 && emDigits.startsWith('0')) newEmergencyContactNumber = '+63' + emDigits.slice(1);
            else if (emDigits.length === 10) newEmergencyContactNumber = '+63' + emDigits;
            if (!newEmergencyContactName || !newEmergencyContactNumber) {
                isCreatingDonor = false;
                if (createBtn) { createBtn.disabled = false; createBtn.style.opacity = ''; createBtn.style.cursor = ''; createBtn.innerHTML = createBtnOriginalText; }
                showAlertBox(!newEmergencyContactName ? 'Please enter the Emergency Contact Name.' : 'Please enter a valid Emergency Contact Number (e.g. +639123456789).');
                return;
            }

            const newDonorObj = {
                id: newDonorId,
                name: fullName,
                firstName: fName,
                middleName: mName,
                surname: lName,
                ext: ext,
                bloodType: bloodType,
                brgy: brgy,
                venue: venue,
                verified: true,
                contact: contact,
                bday: bday,
                gender: sex,
                sex: sex,
                lastDonation: "N/A",
                timesDonated: "0",
                avatar: avatarSrc,
                weight: newWeight,
                bp: newBp,
                height: newHeight,
                hemoglobin: revHbVal,
                allergies: newAllergies,
                medicalConditions: newMedicalConditions,
                eligibilityStatus: newEligibilityStatus,
                deferralReason: newDeferralReason,
                emergencyContactName: newEmergencyContactName,
                emergencyContactNumber: newEmergencyContactNumber,
                createdBy: getCurrentUserForAudit().name,
                createdAt: new Date().toISOString()
            };

            const endCreatingState = () => {
                isCreatingDonor = false;
                if (createBtn) {
                    createBtn.disabled = false;
                    createBtn.style.opacity = '';
                    createBtn.style.cursor = '';
                    createBtn.innerHTML = createBtnOriginalText;
                }
            };

            {
                apiRequest('/api/edit-requests', 'POST', { type: 'donor_create', donorName: fullName, payload: newDonorObj }).then(data => {
                    if (data && data.request) { editRequests.unshift(data.request); }
                    updateRequestsBadge();
                    endCreatingState();
                    showAlertBox('Donor submitted! Status: Pending (waiting for Approval).' + (isAdminUser() ? '' : ' You can check it in Pending Status.'));
                    resetDonorWizardForm();
                    goToWizardStep(0);
                    syncPendingDonorCards();
                    switchMainPage('home', document.querySelectorAll('.bottom-nav-item')[0]);
                    loadEditRequests();
                }).catch(err => {
                    endCreatingState();
                    showAlertBox(err.isNetworkError ? 'No internet connection. Please try submitting the donor again once you are back online.' : (err.message || 'Error: Could not submit this donor. Please try again.'));
                });
                return;
            }

            apiRequest('/api/donors', 'POST', newDonorObj).then(data => {
                const savedDonor = (data && data.donor) ? data.donor : newDonorObj;
                donorsData.push(savedDonor);
                localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                logAuditEvent('Create', savedDonor);
                renderDonorCards();
                updateStatisticsData();
                endCreatingState();
                showAlertBox('Donor successfully created! A History Record can be added once the donor actually donates.');
                resetDonorWizardForm();
                goToWizardStep(0);
                switchMainPage('home', document.querySelectorAll('.bottom-nav-item')[0]);
            }).catch(err => {
                donorsData.push(newDonorObj);
                localStorage.setItem('redflow_donors_masterlist', JSON.stringify(donorsData));
                logAuditEvent('Create', newDonorObj);
                renderDonorCards();
                updateStatisticsData();
                endCreatingState();
                showAlertBox(err.isNetworkError
                    ? 'No internet connection. The donor was saved on this device only and will need to be re-added once you are back online.'
                    : 'Warning: Could not save this donor to the shared database (' + (err.message || 'unknown error') + "). It is only saved on this device for now.");
                resetDonorWizardForm();
                goToWizardStep(0);
                switchMainPage('home', document.querySelectorAll('.bottom-nav-item')[0]);
            });
        }

        function resetDonorWizardForm() {
            const textFieldIds = [
                'w_firstName', 'w_middleName', 'w_lastName', 'w_contact', 'w_venue',
                'w_weight', 'w_bp', 'w_height', 'w_hemoglobin', 'w_emergencyContactName', 'w_emergencyContactNumber'
            ];
            textFieldIds.forEach(id => {
                const field = document.getElementById(id);
                if (field) field.value = '';
            });
            const contactField = document.getElementById('w_contact');
            if (contactField) contactField.value = '';

            const bdayField = document.getElementById('w_bday');
            if (bdayField) bdayField.value = '';

            const noMiddleBox = document.getElementById('w_noMiddle');
            if (noMiddleBox) noMiddleBox.checked = false;
            const middleField = document.getElementById('w_middleName');
            if (middleField) middleField.disabled = false;

            const selectDefaultIds = ['w_ext', 'w_bloodType', 'w_barangay', 'w_sex'];
            selectDefaultIds.forEach(id => {
                const field = document.getElementById(id);
                if (field) field.selectedIndex = 0;
            });

            initWizardCombos();
            wizardAvatarSrc = '';
            wizardAvatarSex = '';

            const medicalConditionsWrap = document.getElementById('w_medicalConditions_wrap');
            if (medicalConditionsWrap) medicalConditionsWrap.style.display = 'block';

            const avatarPreview = document.getElementById('wizardAvatarPreview');
            if (avatarPreview) avatarPreview.src = defaultAvatarForSex('');
        }

        let currentAboFilter = 'All';
        let currentBrgyFilter = 'All Brgys.';

        function debounce(fn, delayMs = 250) {
            let timer = null;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delayMs);
            };
        }

        function filterDonorsList() {
            const query = document.getElementById('donor-search-input').value.toLowerCase().trim();
            const filtered = donorsData.filter(donor => {
                const matchesSearch = donor.name.toLowerCase().includes(query) || 
                                      donor.brgy.toLowerCase().includes(query) || 
                                      donor.bloodType.toLowerCase().includes(query);
                const matchesAbo = (currentAboFilter === 'All' || donor.bloodType === currentAboFilter);
                const matchesBrgy = (currentBrgyFilter === 'All Brgys.' || donor.brgy === currentBrgyFilter);
                return matchesSearch && matchesAbo && matchesBrgy;
            });
            renderDonorCards(filtered);
        }
        const debouncedFilterDonorsList = debounce(filterDonorsList, 250);

        function filterByAbo(type) {
            currentAboFilter = type;
            toggleDropdown('abo-dropdown');
            filterDonorsList();
        }

        function filterByBrgy(brgy) {
            currentBrgyFilter = brgy;
            toggleDropdown('brgy-dropdown');
            filterDonorsList();
        }

        let editRequests = [];
        let requestsFilter = 'Pending';
        let pendingHistoryRequestId = null;
        let historyRequestCreator = null;
        let historyRequestCreatedAt = null;

        const REQ_FIELD_LABELS = {
            firstName: 'First Name', middleName: 'Middle Name', surname: 'Surname', ext: 'Ext. Name', sex: 'Sex',
            bday: 'Birthday', bloodType: 'Blood Type', contact: 'Contact Number', brgy: 'Barangay',
            weight: 'Weight (kg)', bp: 'Blood Pressure', height: 'Height (cm)', hemoglobin: 'Hemoglobin (g/dL)', eligibilityStatus: 'Eligibility Status', allergies: 'Known Allergies',
            medicalConditions: 'Existing Medical Conditions', deferralReason: 'Deferral / Screening Notes',
            emergencyContactName: 'Emergency Contact Name', emergencyContactNumber: 'Emergency Contact Number'
        };

        function recordStatusChip(status) {
            const pending = status === 'Pending';
            return `<span class="rec-status ${pending ? 'pending' : 'approved'}">${pending ? 'Pending' : 'Approved'}</span>`;
        }
        function getPendingHistoryRequests() {
            return editRequests.filter(r => r.type === 'history_record' && r.status === 'Pending');
        }
        function loadEditRequests() {
            return apiRequest('/api/edit-requests').then(data => {
                editRequests = (data && data.requests) || [];
                syncPendingDonorCards();
                updateRequestsBadge();
                updateStatisticsData();
                renderRequestsView();
                renderMonitoringTable();
            }).catch(() => {});
        }
        function updateRequestsBadge() { updateSidebarBadges(); }
        const REQ_TYPE_TABS = [['donor_edit', 'Submitted Request']];
        const STAFF_REQ_TYPE_TABS = [['donor_create', 'Donor Screening']];
        const REQ_TYPE_META = {
            donor_create: { icon: 'fa-user-plus', sub: 'New donors waiting for screening' },
            donor_edit: { icon: 'fa-pen-to-square', sub: 'Donor information updates' },
            history_record: { icon: 'fa-notes-medical', sub: 'History Records of donations' }
        };
        function requestChangeLines(r) {
            const p = r.payload || {};
            if (r.type === 'donor_edit') {
                const o = r.original || {};
                return Object.keys(p).filter(k => REQ_FIELD_LABELS[k]).map(k => `${REQ_FIELD_LABELS[k]}: ${o[k] == null || o[k] === '' ? 'None' : o[k]} > ${p[k] == null || p[k] === '' ? 'None' : p[k]}`);
            }
            if (r.type === 'donor_create') {
                return [`Blood Type: ${p.bloodType || 'N/A'}`, `Barangay: ${p.brgy || 'N/A'}`, `Venue: ${p.venue || 'N/A'}`, `Weight: ${p.weight || 'N/A'} kg | BP: ${p.bp || 'N/A'} | Height: ${p.height || 'N/A'} cm`, `Eligibility: ${p.eligibilityStatus || 'N/A'}`];
            }
            return [`New Donation: ${p.newDonation || 'N/A'}`, `Times Donated: ${p.timesDonated || 'N/A'}`, `Amount: ${unitLabel(p.amount)}`];
        }
        const REQ_TYPE_TITLES = { donor_create: 'New Donor', donor_edit: 'Donor Information Update', history_record: 'History Record' };
        let requestsType = 'donor_edit';
        let myRequestsType = 'donor_create';
        function requestLabels(r) {
            if (r.type === 'donor_create') return 'Venue: ' + ((r.payload && r.payload.venue) || 'N/A') + ' | Status: ' + r.status;
            if (r.type === 'history_record') return 'New History Record (donation)';
            const l = (r.payload && r.payload._fieldLabels) || [];
            return l.length ? l.join(', ') : 'Donor information';
        }
        let myRequestsFilter = 'All';
        let subRequestsFilter = 'All';
        function renderRequestsView() {
            renderRequestList('reqTabs', 'requestsListContainer', true);
            renderRequestList('myReqTabs', 'myRequestsListContainer', false);
            renderRequestList('subReqTabs', 'subRequestsListContainer', false, 'submitted');
            if (typeof renderDonorScreening === 'function') renderDonorScreening();
        }
        function renderRequestList(tabsId, listId, adminView, mode) {
            const tabs = document.getElementById(tabsId);
            const list = document.getElementById(listId);
            if (!tabs || !list) return;
            const submitted = mode === 'submitted';
            const filter = adminView ? requestsFilter : (submitted ? subRequestsFilter : myRequestsFilter);
            const setter = adminView ? 'requestsFilter' : (submitted ? 'subRequestsFilter' : 'myRequestsFilter');
            const typeVar = adminView ? 'requestsType' : 'myRequestsType';
            const curType = submitted ? 'donor_edit' : (adminView ? requestsType : myRequestsType);
            const meUser = safeParseJSON('redflow_current_user') || {};
            const reqSource = adminView ? editRequests : editRequests.filter(r => !r.requestedByUsername || r.requestedByUsername === meUser.username);
            if (!adminView && !submitted) myRequestsType = 'donor_create';
            const typeTabs = document.getElementById(adminView ? 'reqTypeTabs' : (submitted ? 'subReqTypeTabs' : 'myReqTypeTabs'));
            if (typeTabs) {
                typeTabs.className = 'req-type-grid';
                typeTabs.innerHTML = ((adminView || submitted) ? REQ_TYPE_TABS : STAFF_REQ_TYPE_TABS).map(([k, label]) => {
                    const meta = REQ_TYPE_META[k];
                    const pend = reqSource.filter(r => r.type === k && r.status === 'Pending').length;
                    const total = reqSource.filter(r => r.type === k).length;
                    return `<button class="req-type-card ${curType === k ? 'active' : ''}" onclick="${typeVar}='${k}'; renderRequestsView();">
                        <span class="rtc-ico"><i class="fa-solid ${meta.icon}"></i></span>
                        <span class="rtc-body"><span class="rtc-title">${label}</span><span class="rtc-sub">${meta.sub}</span></span>
                        <span class="rtc-count ${pend ? 'has' : ''}">${pend}<small>pending</small></span>
                    </button>`;
                }).join('');
            }
            const typed = reqSource.filter(r => r.type === curType);
            const counts = { Pending: 0, Approved: 0, Rejected: 0, All: typed.length };
            typed.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
            tabs.innerHTML = ['Pending', 'Approved', 'Rejected', 'All'].map(t =>
                `<button class="req-tab ${filter === t ? 'active' : ''}" onclick="${setter}='${t}'; renderRequestsView();">${t} (${counts[t]})</button>`).join('');
            const shown = typed.filter(r => filter === 'All' || r.status === filter);
            if (shown.length === 0) {
                list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px 10px;">No ${filter === 'All' ? '' : filter.toLowerCase() + ' '}requests.</p>`;
                return;
            }
            const delAllBar = ((filter === 'Approved' || filter === 'Rejected'))
                ? `<div style="text-align:right; margin-bottom:10px;"><button class="req-btn no" onclick="deleteAllRequestsByStatus('${filter}')"><i class="fa-solid fa-trash"></i> Delete All ${filter} (${shown.length})</button></div>` : '';
            list.innerHTML = delAllBar + '<div class="rc-list">' + shown.map(r => {
                const st = r.status.toLowerCase();
                const meta = REQ_TYPE_META[r.type] || REQ_TYPE_META.donor_edit;
                const typeLabel = REQ_TYPE_TITLES[r.type] || 'Request';
                const lines = requestChangeLines(r);
                return `<div class="rc ${st}">
                    <div class="rc-head">
                        <span class="rc-ico"><i class="fa-solid ${meta.icon}"></i></span>
                        <div class="rc-title"><h4>${esc(r.donorName || 'Donor')}</h4><span class="rc-type">${esc(typeLabel)}</span></div>
                        <span class="req-status ${st}">${esc(r.status)}</span>
                    </div>
                    <div class="rc-grid">
                        <div class="rc-cell"><label>Submitted by</label><span>${adminView ? `${esc(r.requestedBy || 'Staff')}${r.requestedByUsername ? ' (@' + esc(r.requestedByUsername) + ')' : ''}` : 'You'}</span></div>
                        <div class="rc-cell"><label>Date submitted</label><span>${formatLoginTimestamp(r.createdAt)}</span></div>
                        ${r.reviewedBy ? `<div class="rc-cell"><label>${esc(r.status)} by</label><span>${esc(r.reviewedBy)} &middot; ${formatLoginTimestamp(r.reviewedAt)}</span></div>` : ''}
                    </div>
                    <div class="rc-lines">${lines.map(l => `<div class="rc-line">${esc(l)}</div>`).join('')}</div>
                    ${r.reason ? `<div class="req-reason"><strong>Reason:</strong> ${esc(r.reason)}</div>` : ''}
                    <div class="rc-actions">
                        <button class="req-btn view" onclick="openRequestView(${esc(r.id)})"><i class="fa-solid fa-file-lines"></i> View Full Form</button>
                        ${(adminView && r.status === 'Pending') ? `
                            <button class="req-btn view" style="background:#1e5fd6;" onclick="openChangeInfo(${esc(r.id)})"><i class="fa-solid fa-pen"></i> Change Info</button>` : ''}
                        ${(r.status !== 'Pending') ? `<button class="req-btn no" onclick="deleteEditRequest(${esc(r.id)})"><i class="fa-solid fa-trash"></i> Delete</button>` : ''}
                    </div>
                </div>`;
            }).join('') + '</div>';
        }

        function goToDonorScreening() {
            const items = document.querySelectorAll('#sidebarMenuContainer .side-custom-btn');
            let target = null;
            items.forEach(el => { if (!target && /Donor Screening/i.test(el.textContent || '')) target = el; });
            switchMainPage('donorscreening', target);
            loadEditRequests();
            renderDonorScreening();
        }
        let dsFilter = 'Pending';
        let dsType = 'donor_create';
        const DS_TYPES = [['donor_create', 'Donor Screening']];
        function renderDonorScreening() {
            const typeTabs = document.getElementById('dsTypeTabs');
            const tabs = document.getElementById('dsTabs');
            const list = document.getElementById('dsList');
            if (!tabs || !list || !isInventoryUser()) return;
            if (typeTabs) {
                typeTabs.className = 'req-type-grid';
                typeTabs.innerHTML = DS_TYPES.map(([k, label]) => {
                    const meta = REQ_TYPE_META[k];
                    const pend = editRequests.filter(r => r.type === k && r.status === 'Pending').length;
                    return `<button class="req-type-card ${dsType === k ? 'active' : ''}" onclick="dsType='${k}'; renderDonorScreening();">
                        <span class="rtc-ico"><i class="fa-solid ${meta.icon}"></i></span>
                        <span class="rtc-body"><span class="rtc-title">${label}</span><span class="rtc-sub">${meta.sub}</span></span>
                        <span class="rtc-count ${pend ? 'has' : ''}">${pend}<small>pending</small></span>
                    </button>`;
                }).join('');
            }
            const typed = editRequests.filter(r => r.type === dsType && r.type !== 'history_record');
            const counts = { Pending: 0, Approved: 0, Rejected: 0, All: typed.length };
            typed.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
            tabs.innerHTML = ['Pending', 'Approved', 'Rejected', 'All'].map(t =>
                `<button class="req-tab ${dsFilter === t ? 'active' : ''}" onclick="dsFilter='${t}'; renderDonorScreening();">${t} (${counts[t]})</button>`).join('');
            const dsQuery = searchValue('dsSearch');
            const shown = typed.filter(r => (dsFilter === 'All' || r.status === dsFilter) && (!dsQuery || [r.donorName, (r.payload || {}).bloodType].join(' ').toLowerCase().includes(dsQuery)));
            dsShownIds = shown.filter(r => r.status !== 'Pending').map(r => r.id);
            const dsToolsEarly = document.getElementById('dsDeleteTools');
            if (dsToolsEarly) dsToolsEarly.style.display = isInventoryUser() ? 'flex' : 'none';
            if (shown.length === 0) {
                refreshDsDeleteBtn();
                list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px 10px;">No ${dsFilter === 'All' ? '' : dsFilter.toLowerCase() + ' '}requests.</p>`;
                return;
            }
            dsShownIds = shown.filter(r => r.status !== 'Pending').map(r => r.id);
            const existingIds = new Set(editRequests.map(r => r.id));
            Array.from(selectedDsIds).forEach(id => { if (!existingIds.has(id)) selectedDsIds.delete(id); });
            const dsTools = document.getElementById('dsDeleteTools');
            if (dsTools) dsTools.style.display = isInventoryUser() ? 'flex' : 'none';
            list.innerHTML = '<div class="rc-list">' + shown.map(r => {
                const st = r.status.toLowerCase();
                const meta = REQ_TYPE_META[r.type] || REQ_TYPE_META.donor_edit;
                const typeLabel = REQ_TYPE_TITLES[r.type] || 'Request';
                const lines = requestChangeLines(r);
                return `<div class="rc ${st}">
                    <div class="rc-head">
                        ${r.status !== 'Pending' ? `<input type="checkbox" class="admin-row-checkbox ds-check" ${selectedDsIds.has(r.id) ? 'checked' : ''} onchange="toggleDsSelect(${r.id}, this.checked)">` : ''}
                        <span class="rc-ico"><i class="fa-solid ${meta.icon}"></i></span>
                        <div class="rc-title"><h4>${esc(r.donorName || 'Donor')}</h4><span class="rc-type">${esc(typeLabel)}</span></div>
                        <span class="req-status ${st}">${esc(r.status)}</span>
                    </div>
                    <div class="rc-grid">
                        <div class="rc-cell"><label>Submitted by</label><span>${esc(r.requestedBy || 'Staff')}${r.requestedByUsername ? ' (@' + esc(r.requestedByUsername) + ')' : ''}</span></div>
                        <div class="rc-cell"><label>Date submitted</label><span>${formatLoginTimestamp(r.createdAt)}</span></div>
                        ${r.reviewedBy ? `<div class="rc-cell"><label>${esc(r.status)} by</label><span>${esc(r.reviewedBy)} &middot; ${formatLoginTimestamp(r.reviewedAt)}</span></div>` : ''}
                    </div>
                    <div class="rc-lines">${lines.map(l => `<div class="rc-line">${esc(l)}</div>`).join('')}</div>
                    ${r.reason ? `<div class="req-reason"><strong>Reason:</strong> ${esc(r.reason)}</div>` : ''}
                    <div class="rc-actions">
                        <button class="req-btn view" onclick="openRequestView(${esc(r.id)})"><i class="fa-solid fa-file-lines"></i> View Full Form</button>
                        ${r.status === 'Pending' ? `
                            <button class="req-btn view" style="background:#1e5fd6;" onclick="openChangeInfo(${esc(r.id)})"><i class="fa-solid fa-pen"></i> Change Info</button>` : ''}
                        ${r.status !== 'Pending' ? `<button class="req-btn no" onclick="deleteDsRequests([${Number(r.id)}])"><i class="fa-solid fa-trash"></i> Delete</button>` : ''}
                    </div>
                </div>`;
            }).join('') + '</div>';
            refreshDsDeleteBtn();
        }
        let selectedDsIds = new Set();
        let dsShownIds = [];
        function refreshDsDeleteBtn() {
            const btn = document.getElementById('dsDeleteBtn');
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-trash"></i> DELETE (${selectedDsIds.size})`;
                btn.classList.toggle('active', selectedDsIds.size > 0);
            }
            const all = document.getElementById('dsSelectAll');
            if (all) all.checked = dsShownIds.length > 0 && dsShownIds.every(id => selectedDsIds.has(id));
        }
        function toggleDsSelect(id, checked) {
            if (checked) selectedDsIds.add(id); else selectedDsIds.delete(id);
            refreshDsDeleteBtn();
        }
        function toggleSelectAllDs(checked) {
            dsShownIds.forEach(id => { if (checked) selectedDsIds.add(id); else selectedDsIds.delete(id); });
            document.querySelectorAll('#dsList .ds-check').forEach(cb => { cb.checked = checked; });
            refreshDsDeleteBtn();
        }
        function deleteSelectedDs() {
            deleteDsRequests(Array.from(selectedDsIds));
        }
        function deleteDsRequests(ids) {
            if (!ids || !isInventoryUser()) return;
            ids = ids.filter(id => { const r = editRequests.find(x => x.id === id); return r && r.status !== 'Pending'; });
            if (!ids.length) return;
            showConfirmBox(`⚠️ Delete ${ids.length} request${ids.length === 1 ? '' : 's'}? This cannot be undone.`, () => {
                return apiRequest('/admin/edit-requests-bulk', 'DELETE', { ids: ids }).then(() => {
                    editRequests = editRequests.filter(r => !ids.includes(r.id));
                    ids.forEach(id => selectedDsIds.delete(id));
                    updateRequestsBadge(); renderRequestsView(); renderMonitoringTable();
                    showAlertBox('Selected request' + (ids.length === 1 ? ' was' : 's were') + ' deleted successfully.');
                }).catch(err => showAlertBox(err.message || 'Error: Could not delete the selected requests.'));
            }, 'Delete Requests');
        }

        const CI_FIELDS = [
            ['name', 'Full Name', 'text'], ['bloodType', 'Blood Type', 'blood'], ['sex', 'Sex', 'sex'], ['bday', 'Birthday', 'date'],
            ['contact', 'Contact Number', 'text'], ['brgy', 'Barangay', 'brgy'], ['venue', 'Venue', 'text'],
            ['weight', 'Weight (kg)', 'text'], ['bp', 'Blood Pressure', 'text'], ['height', 'Height (cm)', 'text'], ['hemoglobin', 'Hemoglobin (g/dL)', 'text'],
            ['eligibilityStatus', 'Eligibility Status', 'elig'], ['allergies', 'Known Allergies', 'text'], ['medicalConditions', 'Existing Medical Conditions', 'text'],
            ['deferralReason', 'Deferral / Screening Notes', 'text'], ['emergencyContactName', 'Emergency Contact Name', 'text'], ['emergencyContactNumber', 'Emergency Contact Number', 'text']
        ];
        const CI_HISTORY_FIELDS = [
            ['name', 'Full Name', 'text'], ['location', 'Location', 'text'], ['bloodType', 'Blood Type', 'blood'],
            ['priorLastDonation', 'Last Donation', 'date'], ['newDonation', 'New Donation', 'date'], ['amount', 'Amount', 'text']
        ];
        let changeInfoOriginal = {};
        let changeInfoFields = CI_FIELDS;
        function changeInfoFieldsFor(r) {
            if (r.type === 'history_record') return CI_HISTORY_FIELDS;
            if (r.type === 'donor_edit') return Object.keys(r.payload || {}).filter(k => REQ_FIELD_LABELS[k]).map(k => [k, REQ_FIELD_LABELS[k], k === 'bday' ? 'date' : 'text']);
            return CI_FIELDS;
        }
        function openChangeInfo(id) {
            const r = editRequests.find(x => String(x.id) === String(id));
            if (!r || r.status !== 'Pending' || !isInventoryUser()) return;
            const p = r.payload || {};
            changeInfoOriginal = {};
            changeInfoFields = changeInfoFieldsFor(r);
            const brgyOpts = Array.from((document.getElementById('w_barangay') || { options: [] }).options).map(o => o.value).filter(v => v);
            const opts = (list, cur) => {
                const all = cur && !list.includes(cur) ? [cur].concat(list) : list;
                return all.map(v => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');
            };
            document.getElementById('ci_requestId').value = r.id;
            document.getElementById('changeInfoBody').innerHTML = changeInfoFields.map(([key, label, type]) => {
                const cur = p[key] == null ? '' : String(p[key]);
                changeInfoOriginal[key] = cur;
                let input;
                if (type === 'blood') input = `<select id="ci_${key}">${opts(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], cur)}</select>`;
                else if (type === 'sex') input = `<select id="ci_${key}">${opts(['Male', 'Female'], cur)}</select>`;
                else if (type === 'elig') input = `<select id="ci_${key}">${opts(['Eligible', 'Permanently Deferred', 'Under Review', 'Others'], cur)}</select>`;
                else if (type === 'brgy') input = `<select id="ci_${key}">${opts(brgyOpts, cur)}</select>`;
                else if (type === 'date') input = `<input type="date" id="ci_${key}" value="${esc(cur)}">`;
                else input = `<input type="text" id="ci_${key}" value="${esc(cur)}" maxlength="120">`;
                return `<div class="form-group-custom"><label style="font-size:11px; text-transform:uppercase;">${esc(label)}</label>${input}</div>`;
            }).join('');
            openModal('changeInfoModal');
        }
        function saveChangeInfo() {
            const id = document.getElementById('ci_requestId').value;
            const r = editRequests.find(x => String(x.id) === String(id));
            const changed = {};
            changeInfoFields.forEach(([key]) => {
                const el = document.getElementById('ci_' + key);
                const v = el ? el.value.trim() : '';
                if (v !== changeInfoOriginal[key]) changed[key] = v;
            });
            if (Object.prototype.hasOwnProperty.call(changed, 'name') && !changed.name) { showAlertBox('Full Name cannot be empty.'); return; }
            if (r && r.type === 'history_record' && (changed.newDonation !== undefined || changed.priorLastDonation !== undefined)) {
                const pl = r.payload || {};
                const nd = changed.newDonation !== undefined ? changed.newDonation : (pl.newDonation || '');
                const ld = changed.priorLastDonation !== undefined ? changed.priorLastDonation : (pl.priorLastDonation || '');
                if (!nd) { showAlertBox('New Donation date cannot be empty.'); return; }
                const iso = /^\d{4}-\d{2}-\d{2}$/;
                changed.timesDonated = String(new Set([nd, ld].filter(d => iso.test(d || ''))).size || 1);
            }
            if (Object.keys(changed).length === 0) { showAlertBox('No changes were made.'); return; }
            const btn = document.getElementById('ciSaveBtn');
            if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
            apiRequest('/admin/edit-requests/' + id + '/change-info', 'PATCH', { payload: changed }).then(data => {
                const i = editRequests.findIndex(x => String(x.id) === String(id));
                if (i !== -1 && data && data.request) editRequests[i] = data.request;
                closeModal('changeInfoModal');
                renderDonorScreening();
                if (typeof renderRequestsView === 'function') renderRequestsView();
                syncPendingDonorCards();
                showAlertBox('Information changed successfully! The change was recorded in the Audit Log.');
                if (typeof refreshAuditLogFromServer === 'function') refreshAuditLogFromServer();
            }).catch(err => showAlertBox(err.message || 'Error: Could not change this information.')).finally(() => {
                if (btn) { btn.disabled = false; btn.style.opacity = ''; }
            });
        }

        function deleteAllRequestsByStatus(status) {
            if (status !== 'Approved' && status !== 'Rejected') return;
            const n = editRequests.filter(r => r.status === status).length;
            if (n === 0) return;
            showConfirmBox(`⚠️ Delete ALL ${n} ${status} request${n === 1 ? '' : 's'}? They will be permanently removed.`, () => {
                return apiRequest((isInventoryUser() ? '/admin' : '/api') + '/edit-requests-status/' + status, 'DELETE').then(() => {
                    editRequests = editRequests.filter(r => r.status !== status);
                    renderRequestsView(); renderMonitoringTable();
                    showAlertBox(`All ${status.toLowerCase()} requests were deleted successfully.`);
                }).catch(err => showAlertBox(err.message || 'Error: Could not delete the requests.'));
            }, 'Delete All ' + status);
        }
        function deleteEditRequest(id) {
            const r = editRequests.find(x => String(x.id) === String(id));
            if (!r || (r.status === 'Pending' && !isInventoryUser())) return;
            showConfirmBox(`⚠️ Delete this request from ${r.requestedBy} for ${r.donorName}? It will be permanently removed${r.status === 'Pending' ? ' and will NOT be applied' : ''}.`, () => {
                return apiRequest((isInventoryUser() ? '/admin' : '/api') + '/edit-requests/' + r.id, 'DELETE').then(() => {
                    editRequests = editRequests.filter(x => String(x.id) !== String(id));
                    updateRequestsBadge(); renderRequestsView(); renderMonitoringTable();
                    showAlertBox('The request was deleted successfully.');
                }).catch(err => showAlertBox(err.message || 'Error: Could not delete this request.'));
            }, 'Delete Request');
        }
        function openRequestView(id, closeOnly) {
            const r = editRequests.find(x => String(x.id) === String(id));
            if (!r) return;
            const body = document.getElementById('requestViewBody');
            const title = document.getElementById('requestViewTitle');
            const btns = document.getElementById('requestViewButtons');
            let html = `<div class="req-meta" style="margin-bottom:8px;">Submitted by <strong>${esc(r.requestedBy || 'Staff')}</strong> for <strong>${esc(r.donorName || '')}</strong> • <span class="req-status ${r.status.toLowerCase()}">${esc(r.status)}</span></div>`;
            if (r.reason) html += `<div class="req-reason" style="margin-bottom:10px;"><strong>Reason to update / edit:</strong> ${esc(r.reason)}</div>`;
            if (r.type === 'donor_edit') {
                title.textContent = 'Donor Information — Full Form';
                const orig = r.original || {};
                const ch = r.payload || {};
                html += `<table class="req-full"><thead><tr><th>Field</th><th>Current</th><th>Requested</th></tr></thead><tbody>` +
                    Object.keys(REQ_FIELD_LABELS).map(k => {
                        const cur = orig[k] == null || orig[k] === '' ? 'N/A' : orig[k];
                        const has = Object.prototype.hasOwnProperty.call(ch, k);
                        const req = has ? (ch[k] === '' || ch[k] == null ? 'N/A' : ch[k]) : cur;
                        return `<tr class="${has ? 'changed' : ''}"><td>${esc(REQ_FIELD_LABELS[k])}</td><td>${esc(cur)}</td><td>${esc(req)}${has ? ' ✎' : ''}</td></tr>`;
                    }).join('') + `</tbody></table>`;
            } else if (r.type === 'donor_create') {
                title.textContent = 'New Donor — Full Form';
                const p = r.payload || {};
                const rows = [['Name', p.name], ['Blood Type', p.bloodType], ['Sex', p.sex], ['Birthday', p.bday], ['Contact Number', p.contact], ['Barangay', p.brgy], ['Venue', p.venue],
                    ['Weight (kg)', p.weight], ['Blood Pressure', p.bp], ['Height (cm)', p.height], ['Hemoglobin (g/dL)', p.hemoglobin || 'Not provided'], ['Eligibility Status', p.eligibilityStatus], ['Allergies', p.allergies], ['Medical Conditions', p.medicalConditions], ['Deferral / Screening Notes', p.deferralReason],
                    ['Emergency Contact Name', p.emergencyContactName], ['Emergency Contact Number', p.emergencyContactNumber], ['Status', r.status === 'Pending' ? 'Pending (waiting for Approval)' : r.status]];
                html += `<table class="req-full"><tbody>` + rows.map(([k, v]) => `<tr><td style="font-weight:700;">${esc(k)}</td><td>${esc(v == null || v === '' ? 'N/A' : v)}</td></tr>`).join('') + `</tbody></table>`;
            } else {
                title.textContent = 'History Record — Full Form';
                const p = r.payload || {};
                const rows = [['Donor\'s Name', p.name], ['Location', p.location], ['Blood Type', p.bloodType], ['New Donation', p.newDonation],
                    ['Last Donation', fmtMDY(p.priorLastDonation || 'N/A')], ['Times Donated', p.timesDonated], ['Amount', unitLabel(p.amount)], ['Status', 'Pending (waiting for Approval)']];
                html += `<table class="req-full"><tbody>` + rows.map(([k, v]) => `<tr><td style="font-weight:700;">${esc(k)}</td><td>${esc(v == null || v === '' ? 'N/A' : v)}</td></tr>`).join('') + `</tbody></table>`;
            }
            body.innerHTML = html;
            btns.innerHTML = `<button class="modal-btn btn-cancel" onclick="closeModal('requestViewModal')">Close</button>` +
                ((r.status === 'Pending' && isInventoryUser() && !closeOnly) ? `
                    <button class="modal-btn btn-confirm" style="background:var(--primary-red);" onclick="closeModal('requestViewModal'); rejectEditRequest(${r.id})">Reject</button>
                    <button class="modal-btn btn-confirm" style="background:var(--success-green);" onclick="closeModal('requestViewModal'); approveEditRequest(${r.id})">Approve</button>` : '');
            openModal('requestViewModal');
        }
        function showDoubleConfirm(message, onConfirm, title) {
            showTripleConfirm(title, [message, 'Please confirm once more. This action cannot be undone. Do you really want to continue?'], onConfirm);
        }
        function approveEditRequest(id) {
            const r = editRequests.find(x => String(x.id) === String(id));
            if (!r || !isInventoryUser()) return;
            if (r.type === 'donor_create') {
                showDoubleConfirm(`Approve the new donor ${r.donorName} submitted by ${r.requestedBy}? The donor will be added to the Donor Masterlist.`, () => {
                    return apiRequest('/admin/edit-requests/' + r.id + '/approve', 'PATCH').then(() => {
                        showAlertBox('New donor approved successfully! The donor is now in the Donor Masterlist.');
                        hydrateAppDataFromServer();
                        loadEditRequests();
                    }).catch(err => showAlertBox(err.message || 'Error: Could not approve this donor.'));
                }, 'Approve New Donor');
                return;
            }
            showDoubleConfirm(`Approve the edit request from ${r.requestedBy} for ${r.donorName}? The donor information will be updated.`, () => {
                return apiRequest('/admin/edit-requests/' + r.id + '/approve', 'PATCH').then(() => {
                    showAlertBox('Edit request approved successfully! The donor information was updated.');
                    hydrateAppDataFromServer();
                }).catch(err => showAlertBox(err.message || 'Error: Could not approve this request.'));
            }, 'Approve Edit Request');
        }
        function rejectEditRequest(id) {
            const r = editRequests.find(x => String(x.id) === String(id));
            if (!r || !isInventoryUser()) return;
            showDoubleConfirm(`Reject the ${r.type === 'history_record' ? 'History Record' : 'edit request'} from ${r.requestedBy} for ${r.donorName}? Nothing will be changed.`, () => {
                return apiRequest('/admin/edit-requests/' + r.id + '/reject', 'PATCH').then(() => {
                    showAlertBox('The request has been rejected. The donor record was not changed.');
                    loadEditRequests();
                }).catch(err => showAlertBox(err.message || 'Error: Could not reject this request.'));
            }, 'Reject Request');
        }
        function refreshNotificationsFromServer() {
            return apiRequest('/api/notifications').then(data => {
                if (data && data.notifications) {
                    const store = loadNotificationsStore();
                    Object.assign(store, data.notifications);
                    saveNotificationsStore(store);
                    updateNotificationBadge();
                    if (document.getElementById('page-notifications') && document.getElementById('page-notifications').classList.contains('active')) renderNotificationsView();
                }
            }).catch(() => {});
        }
        setInterval(() => {
            if (localStorage.getItem('redflow_logged_in') !== 'true') return;
            loadBloodBags();
            refreshNotificationsFromServer();
            if (isAdminUser()) apiRequest('/api/users').then(d => { if (d && d.users) { systemUsers = d.users; updateSidebarBadges(); } }).catch(() => {});
            apiRequest('/api/edit-requests').then(data => {
                editRequests = (data && data.requests) || [];
                syncPendingDonorCards();
                updateRequestsBadge();
                renderRequestsView();
            }).catch(() => {});
        }, 30000);

        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'flex';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function showAlertBox(message) {
            const card = document.getElementById('alertBoxCard');
            const icon = document.getElementById('alertBoxIcon');
            const title = document.getElementById('alertBoxTitle');
            const msgElem = document.getElementById('alertBoxMessage');

            let type = 'info';
            let iconClass = 'fa-solid fa-circle-info';
            let titleText = 'Notice';
            const lower = String(message).toLowerCase();
            const isDeleteOk = /(deleted|cleared|removed)/.test(lower) && !lower.startsWith('error') && !/(cannot|could not|did not|not deleted|failed|warning|unable|no internet)/.test(lower);
            const isUpdateOk = /^\s*change:/.test(lower) || /(updated successfully|was updated|has been updated|were updated)/.test(lower);
            if (isDeleteOk) {
                type = 'success';
                iconClass = 'fa-solid fa-trash';
                titleText = 'Deleted Successfully';
            } else if (isUpdateOk) {
                type = 'success';
                iconClass = 'fa-solid fa-circle-check';
                titleText = 'Updated Successfully';
            } else if (lower.includes('request has been rejected')) {
                type = 'success';
                iconClass = 'fa-solid fa-circle-check';
                titleText = 'Request Rejected';
            } else if (lower.startsWith('error') || lower.includes('cannot') || lower.includes('incorrect') || lower.includes('not found') || lower.includes('rejected')) {
                type = 'error';
                iconClass = 'fa-solid fa-circle-exclamation';
                titleText = 'Error';
            } else if (lower.includes('successfully') && (lower.includes('deleted') || lower.includes('cleared') || lower.includes('removed'))) {
                type = 'success';
                iconClass = 'fa-solid fa-trash';
                titleText = 'Deleted Successfully';
            } else if (lower.includes('please') || lower.includes('waiting for') || lower.includes('select')) {
                type = 'warning';
                iconClass = 'fa-solid fa-triangle-exclamation';
                titleText = 'Please Check';
            } else if (lower.includes('successfully') || lower.includes('approved') || lower.includes('created') || lower.includes('updated') || lower.includes('submitted') || lower.includes('logged')) {
                type = 'success';
                iconClass = 'fa-solid fa-circle-check';
                titleText = 'Success';
            }

            card.classList.remove('type-info', 'type-error', 'type-warning', 'type-success');
            card.classList.add('type-' + type);
            icon.innerHTML = `<i class="${iconClass}"></i>`;
            title.innerText = titleText;
            msgElem.innerText = message;
            openModal('alertBoxModal');
        }

        (function redflowBuildCheck() {
            const EXPECTED_BUILD = '83';
            setTimeout(() => {
                const marker = document.getElementById('redflowBuild');
                const found = marker && marker.dataset ? marker.dataset.build : '';
                if (found === EXPECTED_BUILD) return;
                if (!document.getElementById('app-shell') && !marker && !document.getElementById('page-home')) return;
                try {
                    if (sessionStorage.getItem('redflowBuildWarned') === '1') return;
                    sessionStorage.setItem('redflowBuildWarned', '1');
                } catch (e) { }
                alert('REDFLOW files are mismatched (JS build ' + EXPECTED_BUILD + ', page build ' + (found || 'old') + ').\nPlease copy the WHOLE project folder, especially resources/views/partials/app-shell.blade.php, then run: php artisan view:clear and refresh with Ctrl+F5.');
            }, 1500);
        })();
