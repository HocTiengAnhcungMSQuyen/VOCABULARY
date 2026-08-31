document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginView = document.getElementById('login-view');
    const loginForm = document.getElementById('login-form');
    const mainContainer = document.getElementById('mainContainer');
    const userBar = document.getElementById('user-bar');
    const userDisplayName = document.getElementById('user-display-name');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const adminControls = document.getElementById('admin-controls');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminView = document.getElementById('admin-view');
    const adminCloseBtn = document.getElementById('admin-close-btn');
    const adminClassSelect = document.getElementById('admin-class-select');
    const studentSelect = document.getElementById('student-select');
    const studentSummary = document.getElementById('student-summary');
    const adminUnitList = document.getElementById('admin-unit-list');
    const openAllUnitsBtn = document.getElementById('open-all-units-btn');
    const closeAllUnitsBtn = document.getElementById('close-all-units-btn');
    const adminProgressTotal = document.getElementById('admin-progress-total');
    const adminProgressList = document.getElementById('admin-progress-list');

    // ============================================================
    // TÊN HIỂN THỊ MẶC ĐỊNH CỦA CÁC LỚP
    // Chỉ cần sửa phần này rồi upload lên GitHub là tên mặc định
    // trong code sẽ được cập nhật.
    // Admin vẫn có thể đổi tên trực tiếp trên giao diện.
    // ============================================================
    const DEFAULT_CLASS_NICKNAMES = {
        1: 'ENG KID 1',
        2: 'ENG KID 2',
        3: 'ENG 3',
        4: 'ENG 4',
        5: 'ENG MOVER',
        6: 'ENG FLYER',
        7: 'ENG 7',
        8: 'ENG 8',
        9: 'ENG TEEN',
        10: 'ENG 10',
        11: 'ENG HIGHSCHOOL',
        12: 'ENG CAMBRIDGE 2'
    };

    const CLASS_NICKNAME_STORAGE_KEY = 'flashcard_class_nicknames';

    function getClassNicknames() {
        try {
            const saved = localStorage.getItem(CLASS_NICKNAME_STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            console.warn('Không đọc được biệt danh lớp từ localStorage.', error);
            return {};
        }
    }

    function getClassDisplayName(grade) {
        const nicknames = getClassNicknames();
        const customName = nicknames[String(grade)];
        return typeof customName === 'string' && customName.trim()
            ? customName.trim()
            : (DEFAULT_CLASS_NICKNAMES[Number(grade)] || `Lớp ${grade}`);
    }

    function saveClassNickname(grade, nickname) {
        const nicknames = getClassNicknames();
        const cleanName = String(nickname || '').trim();

        if (cleanName) {
            nicknames[String(grade)] = cleanName;
        } else {
            // Xóa tên tùy chỉnh để quay về DEFAULT_CLASS_NICKNAMES.
            delete nicknames[String(grade)];
        }

        localStorage.setItem(CLASS_NICKNAME_STORAGE_KEY, JSON.stringify(nicknames));
        window.dispatchEvent(new CustomEvent('class-nickname-updated', {
            detail: { grade: Number(grade), name: getClassDisplayName(grade) }
        }));
    }


    const gradeView = document.getElementById('grade-view');
    const unitView = document.getElementById('unit-view');
    const vocabView = document.getElementById('vocab-view');
    const pageTitle = document.getElementById('page-title');
    const backBtn = document.getElementById('back-btn');

    const playAudioBtn = document.getElementById('playAudioBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const flipCard = document.getElementById('flipCard');

    // --- 1. HÀM MÃ HÓA MẬT KHẨU (SHA-256) ---
    async function hashPassword(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        if (!crypto || !crypto.subtle) {
            alert("Trình duyệt hoặc môi trường kết nối (HTTP) không hỗ trợ Web Crypto API!");
            return "";
        }
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // --- 2. CƠ SỞ DỮ LIỆU TÀI KHOẢN DẠNG HASH ---
    const usersDB = {
        "NguyenThiHongQuyen": { 
            passwordHash: "167aa8c92dcf5c30b2473e6079ed2514cdc1c4949859c4ab3c446141ce2d5629", 
            name: "Nguyễn Thị Hồng Quyên (Admin)", 
            grades: "ALL" 
        },
        //ENG FLYER
        "NguyenDuongGiaBao":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Nguyễn Dương Gia Bảo",
            grades: [6] },
        "TranMinhNhan":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Trần Minh Nhàn",
            grades: [6] },
        "TrinhTienNam":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Trịnh Tiến Nam",
            grades: [6] },
        "NguyenTranTungBach":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Nguyễn Trần Tùng Bách",
            grades: [6] },
        "TranHuyTuan":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Trần Huy Tuấn",
            grades: [6] },
        "DoTuanMinh":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Đỗ Tuấn Minh",
            grades: [6] },
        "MaiHaVy":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Mai Hà Vy",
            grades: [6] },
        "NguyenQuynhChi":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Nguyễn Quỳnh Chi",
            grades: [6] },
        "LuongGiaPhat":
            { passwordHash: "72c005a91fda615fe2abfa810d0fd7df8c9312f790692051c4e5a3abe85d7d54",
            name: "Lương Gia Phát",
            grades: [6] },
        //ENG TEEN
        "QuachPhuongAnh":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Quách Phương Anh",
            grades: [9] },
        "TranVietAnh":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Trần Việt Anh",
            grades: [9] },
        "NguyenVanAnh":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Nguyễn Vân Anh",
            grades: [9] },
        "LuongNgocYen":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Lương Ngọc Yến",
            grades: [9] },
        "NguyenKhanhDan":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Nguyễn Khánh Đan",
            grades: [9] },
        "PhungVanKhanh":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Phùng Văn Khánh",
            grades: [9] },
        "NguyenThiDieuLinh":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53", 
            name: "Nguyễn Thị Diệu Linh",
            grades: [9] },
        "NguyenGiaHung":
            { passwordHash: "1433a95b77e8c1b38f6358663b21aac75e941d765e84e6e1bb4d30d451d4ea53",
            name: "Nguyễn Gia Hưng",
            grades: [9] },
        //ENG HS
        "NguyenMinhDuc":
            { passwordHash: "f82d70e0fe2c3f5c0ac074beba567708b1bb646046432a11431113036e6c9561",
            name: "Nguyễn Minh Đức",
            grades: [11] },
        "NguyenVanThanh":
            { passwordHash: "f82d70e0fe2c3f5c0ac074beba567708b1bb646046432a11431113036e6c9561",
            name: "Nguyễn Văn Thành",
            grades: [11] },
        "TranDieuLy":
            { passwordHash: "f82d70e0fe2c3f5c0ac074beba567708b1bb646046432a11431113036e6c9561",
            name: "Trần Diệu Ly",
            grades: [11] },
        "TranThanhThu":
            { passwordHash: "f82d70e0fe2c3f5c0ac074beba567708b1bb646046432a11431113036e6c9561",
            name: "Trần Thanh Thư",
            grades: [11] }
    };

    let currentUser = null;

    // --- 3. DỮ LIỆU TỪ VỰNG DỰ PHÒNG & TẢI FILE JSON ---
    let vocabData = {
        "10-1": [
            { topic: "UNIT 1: FAMILY LIFE", word: "Benefit", pronunciation: "/ˈbenɪfɪt/", type: "N", meaning: "Lợi ích" },
            { topic: "UNIT 1: FAMILY LIFE", word: "Bond", pronunciation: "/bɒnd/", type: "N", meaning: "Sự gắn bó" },
            { topic: "UNIT 1: FAMILY LIFE", word: "Breadwinner", pronunciation: "/ˈbredwɪnə(r)/", type: "N", meaning: "Trụ cột gia đình" }
        ]
    };

    async function fetchVocabJson() {
        try {
            const res = await fetch('vocab.json');
            if (res.ok) {
                const data = await res.json();
                vocabData = { ...vocabData, ...data };
            }
        } catch (err) {
            console.warn("Đang dùng dữ liệu từ vựng nội bộ.");
        }
    }



    // --- 4A. THEO DÕI TIẾN TRÌNH HỌC (LOCALSTORAGE) ---
    // Mỗi học sinh có tiến trình riêng theo lớp -> Unit.
    // Tiến trình lưu số thẻ đã xem/tổng số thẻ và thẻ hiện tại.
    const STUDY_PROGRESS_STORAGE_KEY = 'flashcard_study_progress';

    function getStudyProgress() {
        try {
            const saved = localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (e) {
            console.warn('Không đọc được tiến trình học từ localStorage.');
            return {};
        }
    }

    function saveStudyProgress(progress) {
        localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    }

    function getProgressKey(username, grade, unit) {
        return `${username}__${grade}-${unit}`;
    }

    function getUnitProgress(username, grade, unit) {
        const progress = getStudyProgress();
        return progress[getProgressKey(username, grade, unit)] || {
            viewed: [],
            currentIndex: 0,
            total: Array.isArray(vocabData[`${grade}-${unit}`]) ? vocabData[`${grade}-${unit}`].length : 0,
            lastViewedAt: null
        };
    }

    function saveUnitProgress(username, grade, unit, data) {
        const progress = getStudyProgress();
        progress[getProgressKey(username, grade, unit)] = {
            viewed: [...new Set((data.viewed || []).map(Number))],
            currentIndex: Number.isInteger(data.currentIndex) ? data.currentIndex : 0,
            total: Array.isArray(vocabData[`${grade}-${unit}`]) ? vocabData[`${grade}-${unit}`].length : (data.total || 0),
            lastViewedAt: new Date().toISOString()
        };
        saveStudyProgress(progress);
    }

    function markCurrentCardAsViewed() {
        if (!currentUser || isAdmin() || currentGrade == null || currentUnit == null) return;

        const key = getProgressKey(currentUser.username, currentGrade, currentUnit);
        const data = getUnitProgress(currentUser.username, currentGrade, currentUnit);

        if (!data.viewed.includes(currentIndex)) {
            data.viewed.push(currentIndex);
        }

        data.currentIndex = currentIndex;
        data.total = Array.isArray(vocabData[`${currentGrade}-${currentUnit}`])
            ? vocabData[`${currentGrade}-${currentUnit}`].length
            : data.total;

        saveUnitProgress(currentUser.username, currentGrade, currentUnit, data);
        window.dispatchEvent(new CustomEvent('flashcard-progress-updated'));
    }

    function calculateStudentProgress(username, grade) {
        const totalUnits = unitsPerGrade[grade] || 0;
        let totalCards = 0;
        let viewedCards = 0;
        let completedUnits = 0;

        for (let unit = 1; unit <= totalUnits; unit++) {
            const cards = Array.isArray(vocabData[`${grade}-${unit}`]) ? vocabData[`${grade}-${unit}`] : [];
            const total = cards.length;
            const progress = getUnitProgress(username, grade, unit);
            const viewed = Math.min(new Set(progress.viewed || []).size, total);

            totalCards += total;
            viewedCards += viewed;

            if (total > 0 && viewed >= total) completedUnits++;
        }

        const percent = totalCards > 0 ? Math.round((viewedCards / totalCards) * 100) : 0;

        return { totalCards, viewedCards, percent, completedUnits, totalUnits };
    }

    function renderAdminProgress() {
        if (!adminProgressList || !adminProgressTotal || !isAdmin()) return;

        const username = studentSelect.value;
        const grade = getStudentGrade(username);

        adminProgressList.innerHTML = '';

        if (!username || !grade) {
            adminProgressTotal.textContent = '';
            return;
        }

        const summary = calculateStudentProgress(username, grade);
        adminProgressTotal.textContent =
            `${summary.percent}% • ${summary.viewedCards}/${summary.totalCards} thẻ • ${summary.completedUnits}/${summary.totalUnits} Unit hoàn thành`;

        for (let unit = 1; unit <= summary.totalUnits; unit++) {
            const cards = Array.isArray(vocabData[`${grade}-${unit}`]) ? vocabData[`${grade}-${unit}`] : [];
            const total = cards.length;
            const progress = getUnitProgress(username, grade, unit);
            const viewed = Math.min(new Set(progress.viewed || []).size, total);
            const percent = total > 0 ? Math.round((viewed / total) * 100) : 0;
            const lastViewed = progress.lastViewedAt
                ? new Date(progress.lastViewedAt).toLocaleString('vi-VN')
                : 'Chưa học';

            const row = document.createElement('div');
            row.className = 'admin-progress-row';

            const header = document.createElement('div');
            header.className = 'admin-progress-row-header';

            const title = document.createElement('strong');
            title.textContent = `Unit ${unit}`;

            const value = document.createElement('span');
            value.textContent = `${percent}% (${viewed}/${total})`;

            header.appendChild(title);
            header.appendChild(value);

            const track = document.createElement('div');
            track.className = 'admin-progress-track';

            const bar = document.createElement('div');
            bar.className = 'admin-progress-bar';
            bar.style.width = `${percent}%`;
            track.appendChild(bar);

            const meta = document.createElement('div');
            meta.className = 'admin-progress-meta';
            meta.textContent = `Thẻ hiện tại: ${Math.min((progress.currentIndex || 0) + 1, Math.max(total, 1))}/${total || 0} • Lần học gần nhất: ${lastViewed}`;

            row.appendChild(header);
            row.appendChild(track);
            row.appendChild(meta);

            adminProgressList.appendChild(row);
        }
    }

    // --- 4. QUẢN LÝ QUYỀN UNIT (PHƯƠNG ÁN A - LOCALSTORAGE) ---
    // Quyền Unit được lưu riêng trên trình duyệt này.
    // Lần đầu chưa có thiết lập -> mặc định mở tất cả Unit của lớp học sinh.
    const UNIT_PERMISSION_STORAGE_KEY = 'flashcard_unit_permissions';

    function getUnitPermissions() {
        try {
            const saved = localStorage.getItem(UNIT_PERMISSION_STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (e) {
            console.warn('Không đọc được quyền Unit từ localStorage.');
            return {};
        }
    }

    function saveUnitPermissions(permissions) {
        localStorage.setItem(UNIT_PERMISSION_STORAGE_KEY, JSON.stringify(permissions));
    }

    function getStudentUnitPermissions(username, grade) {
        const permissions = getUnitPermissions();
        const userPermissions = permissions[username];

        // Chưa từng cấu hình: mở toàn bộ Unit của lớp đó để không làm thay đổi
        // quyền truy cập hiện tại của các học sinh.
        if (!userPermissions || !Array.isArray(userPermissions[String(grade)])) {
            return Array.from({ length: unitsPerGrade[grade] || 0 }, (_, i) => i + 1);
        }

        return userPermissions[String(grade)]
            .map(Number)
            .filter(unit => unit >= 1 && unit <= (unitsPerGrade[grade] || 0));
    }

    function isAdmin() {
        return !!currentUser && currentUser.username === 'NguyenThiHongQuyen';
    }

    function canAccessUnit(grade, unit) {
        if (!currentUser) return false;
        if (isAdmin()) return true;
        if (!canAccessGrade(grade)) return false;

        return getStudentUnitPermissions(currentUser.username, grade).includes(unit);
    }

    function setStudentUnitPermissions(username, grade, units) {
        const permissions = getUnitPermissions();

        if (!permissions[username]) {
            permissions[username] = {};
        }

        permissions[username][String(grade)] = [...new Set(units.map(Number))]
            .filter(unit => unit >= 1 && unit <= (unitsPerGrade[grade] || 0))
            .sort((a, b) => a - b);

        saveUnitPermissions(permissions);
    }

    function getStudentUsers() {
        return Object.entries(usersDB)
            .filter(([username, user]) => username !== 'NguyenThiHongQuyen' && user.grades !== 'ALL')
            .map(([username, user]) => ({
                username,
                name: user.name,
                grades: Array.isArray(user.grades) ? user.grades : []
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    function getStudentGrade(username) {
        const user = usersDB[username];
        return user && Array.isArray(user.grades) && user.grades.length
            ? user.grades[0]
            : null;
    }

    function getAdminClassList() {
        // Hiển thị đủ lớp 1-12 để Admin có thể đặt tên cho bất kỳ lớp nào,
        // kể cả lớp hiện chưa có học sinh.
        return Array.from({ length: 12 }, (_, index) => index + 1);
    }

    function renderAdminStudents() {
        if (!studentSelect || !adminClassSelect || !isAdmin()) return;

        const students = getStudentUsers();
        const classes = getAdminClassList();
        const previousClass = Number(adminClassSelect.value);
        const previousStudent = studentSelect.value;

        adminClassSelect.innerHTML = '';

        classes.forEach(grade => {
            const option = document.createElement('option');
            option.value = String(grade);
            option.textContent = getClassDisplayName(grade);
            adminClassSelect.appendChild(option);
        });

        if (classes.length === 0) {
            studentSelect.innerHTML = '';
            studentSummary.textContent = 'Chưa có học sinh để quản lý.';
            adminUnitList.innerHTML = '';
            if (adminProgressList) adminProgressList.innerHTML = '';
            if (adminProgressTotal) adminProgressTotal.textContent = '';
            return;
        }

        const selectedClass = classes.includes(previousClass)
            ? previousClass
            : classes[0];

        adminClassSelect.value = String(selectedClass);
        renderAdminClassNicknameEditor();
        renderAdminStudentOptions(selectedClass, previousStudent);
    }

    function renderAdminClassNicknameEditor() {
        if (!adminClassSelect || !adminClassSelect.parentElement || !isAdmin()) return;

        const grade = Number(adminClassSelect.value);
        if (!grade) return;

        let box = document.getElementById('admin-class-nickname-box');

        if (!box) {
            box = document.createElement('div');
            box.id = 'admin-class-nickname-box';
            box.style.cssText = [
                'margin:0 0 14px 0',
                'padding:14px',
                'background:#f5f6fa',
                'border-radius:12px'
            ].join(';');

            const label = document.createElement('label');
            label.htmlFor = 'admin-class-nickname';
            label.textContent = 'Biệt danh lớp';
            label.style.cssText = 'display:block;font-weight:700;color:var(--text-dark);margin-bottom:7px;';

            const row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:10px;';

            const input = document.createElement('input');
            input.id = 'admin-class-nickname';
            input.type = 'text';
            input.maxLength = 40;
            input.placeholder = 'Ví dụ: ENG FLYER';
            input.style.cssText = 'flex:1;min-width:0;padding:11px 13px;border:1px solid #ccd2da;border-radius:10px;background:#fff;color:#333;font-size:1rem;outline:none;';

            const saveBtn = document.createElement('button');
            saveBtn.id = 'save-class-nickname-btn';
            saveBtn.type = 'button';
            saveBtn.className = 'admin-action-btn';
            saveBtn.textContent = '💾 Lưu tên lớp';
            saveBtn.style.cssText = 'background:var(--primary-color);white-space:nowrap;';

            saveBtn.addEventListener('click', () => {
                const selectedGrade = Number(adminClassSelect.value);
                const value = input.value.trim();
                saveClassNickname(selectedGrade, value);
                renderAdminStudents();
                alert(value
                    ? `✅ Đã đổi tên hiển thị cho Lớp ${selectedGrade} thành “${value}”.`
                    : `✅ Đã khôi phục tên mặc định cho Lớp ${selectedGrade}.`);
            });

            row.appendChild(input);
            row.appendChild(saveBtn);

            const note = document.createElement('small');
            note.textContent = 'Tên này được lưu trên trình duyệt bằng localStorage. Xóa nội dung để dùng tên mặc định trong code.';
            note.style.cssText = 'display:block;margin-top:7px;color:#7b8491;font-size:.78rem;';

            box.appendChild(label);
            box.appendChild(row);
            box.appendChild(note);

            adminClassSelect.parentElement.insertAdjacentElement('afterend', box);
        }

        const input = document.getElementById('admin-class-nickname');
        if (input) {
            const nicknames = getClassNicknames();
            input.value = Object.prototype.hasOwnProperty.call(nicknames, String(grade))
                ? nicknames[String(grade)]
                : getClassDisplayName(grade);
        }
    }

    function renderAdminStudentOptions(grade, preferredUsername = '') {
        if (!studentSelect) return;

        const students = getStudentUsers()
            .filter(student => student.grades.includes(Number(grade)))
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

        studentSelect.innerHTML = '';

        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.username;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });

        if (students.length === 0) {
            studentSummary.textContent = `${getClassDisplayName(grade)} chưa có học sinh.`;
            adminUnitList.innerHTML = '';
            if (adminProgressList) adminProgressList.innerHTML = '';
            if (adminProgressTotal) adminProgressTotal.textContent = '';
            return;
        }

        const hasPreferred = students.some(student => student.username === preferredUsername);
        studentSelect.value = hasPreferred ? preferredUsername : students[0].username;

        renderAdminUnits();
    }

    function renderAdminUnits() {
        if (!studentSelect || !adminUnitList || !isAdmin()) return;

        const username = studentSelect.value;
        const grade = getStudentGrade(username);

        adminUnitList.innerHTML = '';

        if (!username || !grade) {
            studentSummary.textContent = 'Chưa có học sinh hợp lệ để quản lý.';
            return;
        }

        const student = usersDB[username];
        const totalUnits = unitsPerGrade[grade] || 0;
        const allowedUnits = getStudentUnitPermissions(username, grade);

        const hasCustomPermission = (() => {
            const allPermissions = getUnitPermissions();
            return !!(
                allPermissions[username] &&
                Array.isArray(allPermissions[username][String(grade)])
            );
        })();

        studentSummary.textContent =
            `${student.name} • ${getClassDisplayName(grade)} • ${allowedUnits.length}/${totalUnits} Unit đang mở` +
            (hasCustomPermission ? '' : ' • Chưa thiết lập, mặc định mở tất cả');

        for (let unit = 1; unit <= totalUnits; unit++) {
            const row = document.createElement('div');
            row.className = 'admin-unit-row';

            const info = document.createElement('div');
            info.className = 'admin-unit-info';

            const title = document.createElement('div');
            title.className = 'admin-unit-title';
            title.textContent = `Unit ${unit}`;

            const status = document.createElement('div');
            status.className = 'admin-unit-status';
            status.textContent = allowedUnits.includes(unit) ? 'Đang mở' : 'Đang đóng';

            info.appendChild(title);
            info.appendChild(status);

            const label = document.createElement('label');
            label.className = 'unit-toggle';
            label.title = allowedUnits.includes(unit) ? 'Đóng Unit' : 'Mở Unit';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = allowedUnits.includes(unit);
            checkbox.setAttribute('aria-label', `Bật hoặc tắt Unit ${unit}`);

            const slider = document.createElement('span');
            slider.className = 'unit-slider';

            checkbox.addEventListener('change', () => {
                const currentUnits = getStudentUnitPermissions(username, grade);
                const nextUnits = checkbox.checked
                    ? [...currentUnits, unit]
                    : currentUnits.filter(item => item !== unit);

                setStudentUnitPermissions(username, grade, nextUnits);
                renderAdminUnits();
            });

            label.appendChild(checkbox);
            label.appendChild(slider);

            row.appendChild(info);
            row.appendChild(label);
            adminUnitList.appendChild(row);
        }

        renderAdminProgress();
    }

    function openAdminPanel() {
        if (!isAdmin()) {
            alert('⛔ Chỉ Admin mới có quyền quản lý Unit.');
            return;
        }

        pageTitle.style.display = 'none';
        gradeView.classList.add('hidden');
        unitView.classList.add('hidden');
        vocabView.classList.add('hidden');
        backBtn.classList.add('hidden');
        adminView.classList.remove('hidden');

        renderAdminStudents();
    }

    function closeAdminPanel() {
        adminView.classList.add('hidden');
        renderGrades();
    }

    function setAllUnitsForSelectedStudent(open) {
        if (!isAdmin()) return;

        const username = studentSelect.value;
        const grade = getStudentGrade(username);

        if (!username || !grade) return;

        const totalUnits = unitsPerGrade[grade] || 0;
        const units = open
            ? Array.from({ length: totalUnits }, (_, i) => i + 1)
            : [];

        setStudentUnitPermissions(username, grade, units);
        renderAdminUnits();
    }

    // --- 4. XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT ---
    function checkAuth() {
        try {
            const savedUser = localStorage.getItem('flashcard_user');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showMainApp();
            } else {
                showLoginForm();
            }
        } catch (e) {
            localStorage.removeItem('flashcard_user');
            showLoginForm();
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        const user = usersDB[usernameInput];

        if (user) {
            const inputPasswordHash = await hashPassword(passwordInput);

            if (inputPasswordHash === user.passwordHash) {
                currentUser = { username: usernameInput, name: user.name, grades: user.grades };
                localStorage.setItem('flashcard_user', JSON.stringify(currentUser));
                loginError.classList.add('hidden');
                showMainApp();
                return;
            }
        }

        loginError.classList.remove('hidden');
    }

    function logout() {
        localStorage.removeItem('flashcard_user');
        currentUser = null;
        showLoginForm();
    }

    function showLoginForm() {
        loginView.classList.remove('hidden');
        mainContainer.classList.add('hidden');
        userBar.classList.add('hidden');
        adminControls.classList.add('hidden');
        adminView.classList.add('hidden');
    }

    function showMainApp() {
        loginView.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        userBar.classList.remove('hidden');
        userDisplayName.textContent = currentUser ? currentUser.name : 'Guest';

        if (isAdmin()) {
            adminControls.classList.remove('hidden');
        } else {
            adminControls.classList.add('hidden');
        }

        adminView.classList.add('hidden');
        renderGrades();
    }

    function canAccessGrade(grade) {
        if (!currentUser) return false;
        if (currentUser.grades === "ALL") return true;
        return Array.isArray(currentUser.grades) && currentUser.grades.includes(grade);
    }

    // --- 5. ĐIỀU HƯỚNG LỚP & UNIT ---
    const unitsPerGrade = {
        1: 16, 2: 16, 3: 20, 4: 20, 5: 20,
        6: 12, 7: 12, 8: 12, 9: 12, 10: 10, 11: 10, 12: 10
    };

    let currentGrade = null;
    let currentUnit = null;
    let currentVocabList = [];
    let currentIndex = 0;

    function renderGrades() {
        pageTitle.style.display = 'block';
        pageTitle.textContent = 'Vui lòng chọn Lớp học';
        gradeView.classList.remove('hidden');
        unitView.classList.add('hidden');
        vocabView.classList.add('hidden');
        backBtn.classList.add('hidden');

        gradeView.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const btn = document.createElement('button');
            if (canAccessGrade(i)) {
                btn.className = 'btn';
                btn.textContent = getClassDisplayName(i);
                btn.addEventListener('click', () => showUnits(i));
            } else {
                btn.className = 'btn btn-locked';
                btn.textContent = `🔒 ${getClassDisplayName(i)}`;
                btn.addEventListener('click', () => alert(`🔒 Bạn không có quyền truy cập Lớp ${i}!`));
            }
            gradeView.appendChild(btn);
        }
    }

    function showUnits(grade) {
        currentGrade = grade;
        pageTitle.style.display = 'block';
        pageTitle.textContent = `${getClassDisplayName(grade)} - Chọn Unit`;
        gradeView.classList.add('hidden');
        unitView.classList.remove('hidden');
        vocabView.classList.add('hidden');
        backBtn.classList.remove('hidden');

        unitView.innerHTML = '';
        const totalUnits = unitsPerGrade[grade] || 10;
        for (let i = 1; i <= totalUnits; i++) {
            const btn = document.createElement('button');
            const unlocked = canAccessUnit(grade, i);

            if (unlocked) {
                btn.className = 'btn';
                btn.textContent = `Unit ${i}`;
                btn.addEventListener('click', () => showVocab(grade, i));
            } else {
                btn.className = 'btn btn-unit-locked';
                btn.textContent = `🔒 Unit ${i}`;
                btn.title = 'Unit này chưa được Admin mở';
                btn.addEventListener('click', () => {
                    alert(`🔒 Unit ${i} chưa được mở cho tài khoản này.`);
                });
            }

            unitView.appendChild(btn);
        }
    }

    function showVocab(grade, unit) {
        if (!isAdmin() && !canAccessUnit(grade, unit)) {
            alert(`🔒 Unit ${unit} chưa được mở cho tài khoản này.`);
            return;
        }

        currentUnit = unit;
        pageTitle.style.display = 'none';
        gradeView.classList.add('hidden');
        unitView.classList.add('hidden');
        vocabView.classList.remove('hidden');
        backBtn.classList.remove('hidden');

        const key = `${grade}-${unit}`;
        currentVocabList = vocabData[key] || [
            { topic: `Lớp ${grade} - Unit ${unit}`, word: "No Data", pronunciation: "", type: "N", meaning: "Chưa có từ vựng" }
        ];

        currentIndex = 0;
        updateCard();
    }

    function updateCard() {
        if (!currentVocabList || currentVocabList.length === 0) return;
        
        if (flipCard) flipCard.classList.remove('flipped');

        const currentItem = currentVocabList[currentIndex];
        document.getElementById("topicText").textContent = currentItem.topic || `UNIT ${currentUnit}`;
        document.getElementById("wordText").textContent = currentItem.word;
        document.getElementById("pronunciationText").textContent = currentItem.pronunciation || '';
        
        // Chuẩn hóa loại từ (loại bỏ ngoặc tròn nếu có sẵn trong JSON)
        const rawType = currentItem.type ? currentItem.type.replace(/[()]/g, '').toLowerCase() : 'n';
        document.getElementById("meaningText").textContent = `(${rawType}): ${currentItem.meaning}`;
        document.getElementById("counterText").textContent = `${currentIndex + 1} / ${currentVocabList.length}`;

        const imgEl = document.getElementById("vocabImage");
        if (currentItem.image) {
            imgEl.src = currentItem.image;
            imgEl.classList.remove("hidden");
        } else {
            imgEl.classList.add("hidden");
        }

        prevBtn.disabled = (currentIndex === 0);
        nextBtn.disabled = (currentIndex === currentVocabList.length - 1);
    }

    function toggleFlip() {
        if (flipCard) flipCard.classList.toggle('flipped');
    }

    function playAudio(e) {
        if (e) e.stopPropagation();
        if (!currentVocabList[currentIndex]) return;
        const word = currentVocabList[currentIndex].word;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-GB';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    function nextCard() {
        if (currentIndex < currentVocabList.length - 1) {
            currentIndex++;
            updateCard();
        }
    }

    function prevCard() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCard();
        }
    }

    // --- 6. GẮN SỰ KIỆN NÚT VÀ BÀN PHÍM ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (playAudioBtn) playAudioBtn.addEventListener('click', playAudio);
    if (prevBtn) prevBtn.addEventListener('click', prevCard);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (flipCard) flipCard.addEventListener('click', toggleFlip);

    if (adminPanelBtn) adminPanelBtn.addEventListener('click', openAdminPanel);
    if (adminCloseBtn) adminCloseBtn.addEventListener('click', closeAdminPanel);
    if (studentSelect) studentSelect.addEventListener('change', renderAdminUnits);
    if (adminClassSelect) {
        adminClassSelect.addEventListener('change', () => {
            renderAdminClassNicknameEditor();
            renderAdminStudentOptions(Number(adminClassSelect.value));
        });
    }
    if (openAllUnitsBtn) openAllUnitsBtn.addEventListener('click', () => setAllUnitsForSelectedStudent(true));
    if (closeAllUnitsBtn) closeAllUnitsBtn.addEventListener('click', () => setAllUnitsForSelectedStudent(false));

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (!adminView.classList.contains('hidden')) {
                closeAdminPanel();
            } else if (!vocabView.classList.contains('hidden')) {
                showUnits(currentGrade);
            } else if (!unitView.classList.contains('hidden')) {
                renderGrades();
            }
        });
    }

    window.addEventListener('flashcard-progress-updated', () => {
        if (isAdmin() && !adminView.classList.contains('hidden')) {
            renderAdminProgress();
        }
    });

    window.addEventListener('storage', (event) => {
        if (event.key === UNIT_PERMISSION_STORAGE_KEY && isAdmin() && !adminView.classList.contains('hidden')) {
            renderAdminUnits();
        }

        if (event.key === STUDY_PROGRESS_STORAGE_KEY && isAdmin() && !adminView.classList.contains('hidden')) {
            renderAdminProgress();
        }
        if (event.key === CLASS_NICKNAME_STORAGE_KEY) {
            if (isAdmin() && !adminView.classList.contains('hidden')) {
                renderAdminStudents();
            }
            if (currentUser && !isAdmin()) {
                if (!gradeView.classList.contains('hidden')) {
                    renderGrades();
                } else if (!unitView.classList.contains('hidden') && currentGrade != null) {
                    showUnits(currentGrade);
                }
            }
        }
        if (event.key === UNIT_PERMISSION_STORAGE_KEY && currentUser && !isAdmin() && !unitView.classList.contains('hidden')) {
            showUnits(currentGrade);
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
        if (vocabView.classList.contains('hidden')) return;

        if (event.key === "ArrowRight") {
            nextCard();
        } else if (event.key === "ArrowLeft") {
            prevCard();
        } else if (event.code === "Space") {
            event.preventDefault();
            toggleFlip();
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            playAudio();
        }
    });

    fetchVocabJson().then(() => {
        checkAuth();
    });
});