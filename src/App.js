import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// ==========================================
// ส่วนประกอบ UI เสริม
// ==========================================
const StatusBadge = ({ status }) => {
  let bgColor, color;
  if (status === "ซ่อมเสร็จแล้ว") {
    bgColor = "#d1fae5";
    color = "#065f46";
  } else if (status === "กำลังซ่อม") {
    bgColor = "#dbeafe";
    color = "#1e40af";
  } else {
    bgColor = "#fef3c7";
    color = "#92400e";
  }

  return (
    <span
      style={{
        backgroundColor: bgColor,
        color: color,
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

const formatDate = (timestamp) => {
  if (!timestamp) return "กำลังอัปเดต...";
  const date = timestamp.toDate();
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ==========================================
// 1. หน้า Login (ดีไซน์ใหม่ องค์กร/วิทยาลัย)
// ==========================================
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/report");
    } catch (err) {
      setError("❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      {/* ฝั่งซ้าย: แบนเนอร์วิทยาลัย */}
      <div className="auth-banner">
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          ระบบแจ้งซ่อม
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, marginTop: "10px" }}>
          วิทยาลัยเทคนิคนนทบุรี
        </p>
        <div
          style={{
            marginTop: "40px",
            fontSize: "15px",
            opacity: 0.8,
            lineHeight: "1.6",
          }}
        >
          "ระบบจัดการและติดตามสถานะการแจ้งซ่อมคอมพิวเตอร์"
        </div>
      </div>

      {/* ฝั่งขวา: ฟอร์มล็อกอิน */}
      <div className="auth-form-side">
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#1e293b", margin: "0 0 5px 0", fontSize: "28px" }}
          >
            เข้าสู่ระบบ
          </h2>
          <p style={{ color: "#64748b", margin: 0 }}>
            กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin} className="form-group">
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="อีเมลผู้ใช้งาน"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-btn"
            style={{ marginTop: "10px" }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="auth-footer">
          ยังไม่มีบัญชีผู้ใช้งาน?{" "}
          <Link to="/register" className="text-blue">
            ลงทะเบียนที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. หน้า สมัครสมาชิก (ดีไซน์ใหม่)
// ==========================================
const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), { email, role });
      alert("🎉 ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
      navigate("/");
    } catch (err) {
      setError("❌ รหัสผ่านต้อง 6 ตัวขึ้นไป หรืออีเมลนี้ถูกใช้แล้ว");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div
        className="auth-banner"
        style={{
          background: "linear-gradient(135deg, #0f766e 0%, #059669 100%)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>📝 สร้างบัญชีใหม่</h1>
        <p style={{ fontSize: "18px", opacity: 0.9, marginTop: "10px" }}>
          ระบบแจ้งซ่อม วิทยาลัยเทคนิคนนทบุรี
        </p>
      </div>

      <div className="auth-form-side">
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#1e293b", margin: "0 0 5px 0", fontSize: "28px" }}
          >
            ลงทะเบียน
          </h2>
          <p style={{ color: "#64748b", margin: 0 }}>
            ระบุข้อมูลเพื่อเปิดการใช้งานระบบ
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleRegister} className="form-group">
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="อีเมลผู้ใช้งาน"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="รหัสผ่าน (6 ตัวขึ้นไป)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-input"
            >
              <option value="user">สถานะ: นักศึกษา / อาจารย์</option>
              <option value="admin">สถานะ: เจ้าหน้าที่ (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-success auth-btn"
            style={{ marginTop: "10px" }}
          >
            {loading ? "กำลังลงทะเบียน..." : "ยืนยันการลงทะเบียน"}
          </button>
        </form>

        <div className="auth-footer">
          มีบัญชีอยู่แล้ว?{" "}
          <Link to="/" className="text-blue">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. หน้า แจ้งปัญหาคอมพิวเตอร์
// ==========================================
const ReportIssue = () => {
  const [formData, setFormData] = useState({
    reporterName: "",
    room: "",
    equipment: "คอมพิวเตอร์",
    issue: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "repair_tickets"), {
        ...formData,
        status: "รอการตรวจสอบ",
        createdAt: serverTimestamp(),
      });
      alert("✅ ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว!");
      setFormData({
        reporterName: "",
        room: "",
        equipment: "คอมพิวเตอร์",
        issue: "",
      });
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>🛠️ แจ้งปัญหาการใช้งาน</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-group">
        <input
          type="text"
          placeholder="ชื่อ-นามสกุล ผู้แจ้ง (เช่น สมชาย ใจดี)"
          value={formData.reporterName}
          onChange={(e) =>
            setFormData({ ...formData, reporterName: e.target.value })
          }
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="ห้อง / สถานที่ (เช่น ห้องคอม 3201)"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          required
          className="input-field"
        />
        <select
          value={formData.equipment}
          onChange={(e) =>
            setFormData({ ...formData, equipment: e.target.value })
          }
          className="input-field"
        >
          <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
          <option value="อินเทอร์เน็ต">อินเทอร์เน็ต</option>
          <option value="เมาส์ / คีย์บอร์ด">เมาส์ / คีย์บอร์ด</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
        <textarea
          placeholder="อาการเสีย (เช่น เปิดเครื่องไม่ติด)"
          value={formData.issue}
          onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
          required
          rows="4"
          className="input-field textarea-field"
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "กำลังส่งข้อมูล..." : "🚀 ส่งเรื่องแจ้งซ่อม"}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 4. หน้า ดูสถานะ
// ==========================================
const TicketList = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const q = query(
        collection(db, "repair_tickets"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchTickets();
  }, []);

  return (
    <div className="card-large">
      <h2 style={{ marginBottom: "20px" }}>📋 รายการแจ้งซ่อมล่าสุด</h2>
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>วันที่แจ้ง</th>
              <th>สถานที่/อุปกรณ์</th>
              <th>ปัญหาที่พบ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(ticket.createdAt)}
                </td>
                <td>
                  <strong>{ticket.room}</strong>
                  <br />
                  <span className="sub-text">{ticket.equipment}</span>
                </td>
                <td>{ticket.issue}</td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 5. หน้า Admin จัดการข้อมูล
// ==========================================
const AdminManage = ({ userRole }) => {
  const [tickets, setTickets] = useState([]);

  if (userRole !== "admin") {
    return (
      <div className="card" style={{ textAlign: "center", padding: "50px" }}>
        <h2 style={{ color: "red" }}>🚫 ไม่อนุญาตให้เข้าถึง</h2>
        <p>คุณไม่มีสิทธิ์เข้าใช้งานหน้านี้ (เฉพาะเจ้าหน้าที่เท่านั้น)</p>
      </div>
    );
  }

  const fetchTickets = async () => {
    const q = query(
      collection(db, "repair_tickets"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "repair_tickets", id), { status: newStatus });
    fetchTickets();
  };

  const handleDelete = async (id) => {
    if (window.confirm("แน่ใจหรือไม่ที่จะลบรายการนี้?")) {
      await deleteDoc(doc(db, "repair_tickets", id));
      fetchTickets();
    }
  };

  return (
    <div className="card-large">
      <h2 style={{ marginBottom: "20px" }}>⚙️ ระบบจัดการสำหรับเจ้าหน้าที่</h2>
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>วันที่แจ้ง</th>
              <th>ข้อมูลผู้แจ้ง</th>
              <th>ปัญหาที่พบ</th>
              <th>สถานะ / จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(ticket.createdAt)}
                </td>
                <td>
                  <strong>{ticket.reporterName}</strong>
                  <br />
                  <span className="sub-text">{ticket.room}</span>
                </td>
                <td>{ticket.issue}</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleUpdateStatus(ticket.id, e.target.value)
                      }
                      className="select-small"
                    >
                      <option value="รอการตรวจสอบ">รอการตรวจสอบ</option>
                      <option value="กำลังซ่อม">กำลังซ่อม</option>
                      <option value="ซ่อมเสร็จแล้ว">ซ่อมเสร็จแล้ว</option>
                    </select>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="btn-danger"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// แถบเมนูนำทาง
// ==========================================
const Navigation = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="nav-container">
      <Link
        to="/report"
        className={`nav-link ${currentPath === "/report" ? "active" : ""}`}
      >
        แจ้งซ่อม
      </Link>
      <Link
        to="/status"
        className={`nav-link ${currentPath === "/status" ? "active" : ""}`}
      >
        ดูสถานะ
      </Link>
      {userRole === "admin" && (
        <Link
          to="/admin"
          className={`nav-link ${currentPath === "/admin" ? "active" : ""}`}
        >
          จัดการ (Admin)
        </Link>
      )}
      <button onClick={handleLogout} className="btn-logout">
        ออกจากระบบ
      </button>
    </nav>
  );
};

// ==========================================
// ตัวจัด Layout หลัก (แยกหน้า Auth กับหน้า App)
// ==========================================
const AppLayout = ({ userRole }) => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register";

  // ถ้าเป็นหน้า Login/Register ให้แสดงแค่พื้นหลังสีเทา 100vh
  if (isAuthPage) {
    return (
      <div className="auth-bg">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  // ถ้าเป็นหน้าอื่นๆ ภายในแอป ให้แสดง Header และ Menu
  return (
    <div className="main-container">
      <div className="app-title">
        <h1>💻 ระบบแจ้งซ่อมคอมพิวเตอร์</h1>
        <p>วิทยาลัยเทคนิคนนทบุรี</p>
      </div>
      <Navigation userRole={userRole} />
      <Routes>
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/status" element={<TicketList />} />
        <Route path="/admin" element={<AdminManage userRole={userRole} />} />
      </Routes>
    </div>
  );
};

// ==========================================
// แอปพลิเคชันหลัก + CSS ฝังตัว
// ==========================================
export default function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserRole(docSnap.data().role);
        else setUserRole("user");
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <style>{`
        * { box-sizing: border-box; font-family: 'Prompt', 'Kanit', sans-serif; }
        body { margin: 0; background-color: #f8fafc; color: #1e293b; }
        
        /* Layouts */
        .auth-bg { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); }
        .main-container { min-height: 100vh; padding: 40px 20px; max-width: 900px; margin: 0 auto; }
        
        /* New Auth Card Split Screen */
        .auth-wrapper { display: flex; flex-direction: row; width: 100%; max-width: 850px; background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); overflow: hidden; }
        .auth-banner { flex: 1.2; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 50px; display: flex; flex-direction: column; justify-content: center; }
        .auth-form-side { flex: 1; padding: 50px 40px; display: flex; flex-direction: column; justify-content: center; background: #ffffff; }
        
        .input-group { display: flex; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; transition: 0.3s; }
        .input-group:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .input-icon { padding: 0 15px; font-size: 18px; color: #64748b; }
        .auth-input { flex: 1; padding: 15px 15px 15px 0; border: none; background: transparent; font-size: 15px; outline: none; color: #1e293b; }
        .auth-btn { border-radius: 12px; font-size: 16px; padding: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); }
        .auth-footer { text-align: center; margin-top: 30px; font-size: 14px; color: #64748b; }
        .error-box { background: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; border: 1px solid #fca5a5; }

        /* General UI */
        .app-title { text-align: center; margin-bottom: 30px; }
        .app-title h1 { color: #0f172a; margin: 0; font-size: 28px; }
        .app-title p { color: #64748b; margin: 5px 0 0 0; }
        .card { max-width: 450px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .card-large { max-width: 850px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .card-header { text-align: center; margin-bottom: 25px; }
        .card-header h2 { margin: 0; }
        
        .form-group { display: flex; flex-direction: column; gap: 16px; }
        .input-field { width: 100%; padding: 14px 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 15px; background-color: #f8fafc; outline: none; }
        .textarea-field { resize: vertical; }
        
        .btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .btn-primary { background-color: #2563eb; color: white; }
        .btn-success { background-color: #10b981; color: white; }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-danger { background-color: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }

        .nav-container { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; background: white; padding: 15px; border-radius: 16px; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .nav-link { text-decoration: none; color: #64748b; padding: 10px 20px; border-radius: 12px; font-weight: 500; transition: all 0.3s; }
        .nav-link.active { background-color: #eff6ff; color: #2563eb; font-weight: bold; }
        .btn-logout { background: none; border: none; color: #ef4444; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 15px; }

        .table-responsive { overflow-x: auto; border-radius: 10px; padding-bottom: 10px; }
        .custom-table { width: 100%; min-width: 600px; border-collapse: separate; border-spacing: 0 10px; text-align: left; }
        .custom-table th { padding: 0 15px 10px 15px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        .custom-table tr { background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-table td { padding: 16px 15px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .sub-text { font-size: 13px; color: #64748b; }
        .select-small { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; }
        .text-blue { color: #2563eb; font-weight: bold; text-decoration: none; }

        /* 📱 MEDIA QUERIES สำหรับมือถือ */
        @media (max-width: 768px) {
          .auth-wrapper { flex-direction: column; }
          .auth-banner { padding: 40px 20px; text-align: center; align-items: center; }
          .auth-form-side { padding: 40px 25px; }
          .main-container { padding: 20px 15px; }
          .card, .card-large { padding: 25px 20px; }
          .nav-container { flex-direction: column; gap: 5px; padding: 10px; }
          .nav-link, .btn-logout { width: 100%; text-align: center; padding: 12px; }
        }
      `}</style>
      <AppLayout userRole={userRole} />
    </Router>
  );
}
