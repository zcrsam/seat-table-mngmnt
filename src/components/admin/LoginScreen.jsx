import { useState } from "react";
import loginBg from "../../assets/bg-login.jpeg";
import bellevueLogo from "../../assets/bellevue-logo.png";

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      if (user === "admin" && pass === "admin123") { onLogin(); }
      else { setError(true); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{ 
      minHeight:"100vh", 
      background:`url(${loginBg}) center/cover no-repeat`,
      position:"relative",
      display:"flex", 
      alignItems:"center", 
      justifyContent:"center", 
      fontFamily:"Montserrat, sans-serif" 
    }}>
      {/* Background overlay with blur and gold tint */}
      <div style={{
        position:"absolute",
        inset:0,
        background:"rgba(201, 168, 76, 0.15)",
        backdropFilter:"blur(8px)",
        WebkitBackdropFilter:"blur(8px)"
      }} />
      
      <div style={{ 
        background:"rgba(255, 255, 255, 0.95)", 
        borderRadius:20, 
        padding:"48px", 
        width:450, 
        maxWidth:"90vw", 
        boxShadow:"0 20px 60px rgba(0,0,0,0.3)", 
        backdropFilter:"blur(10px)",
        position:"relative",
        zIndex:1
      }}>
        {/* Logo and Title */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img 
            src={bellevueLogo} 
            alt="The Bellevue Manila" 
            style={{ 
              width:"120px", 
              height:"auto", 
              marginBottom:16,
              objectFit:"contain"
            }} 
          />
          <div style={{ marginTop:-15, fontSize:28, fontWeight:"bold", color:"#a5852d", marginBottom:-5 }}>Admin Portal</div>
          <div style={{ fontSize:10, color:"#718096", letterSpacing:0, opacity:0.5, fontWeight:"bold" }}>SEAT & TABLE MANAGEMENT</div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background:"rgba(239, 68, 68, 0.1)", 
            border:"1px solid rgba(239, 68, 68, 0.3)", 
            borderRadius:8, 
            padding:"12px 16px", 
            color:"#dc2626", 
            fontFamily:"Montserrat, sans-serif", 
            fontSize:13, 
            marginBottom:20, 
            textAlign:"center",
            display:"flex",
            alignItems:"center",
            gap:8
          }}>
            <span style={{ fontSize:16 }}>⚠</span>
            Invalid credentials. Please try again.
          </div>
        )}

        {/* Form Fields */}
        <div style={{ marginBottom:32 }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a5568", fontFamily:"Montserrat, sans-serif", marginBottom:8 }}>Username</label>
            <input 
              style={{ 
                width:"100%", 
                padding:"14px 16px", 
                borderRadius:10, 
                border:"1px solid #e2e8f0", 
                background:"#f7fafc", 
                color:"#2d3748", 
                fontSize:14, 
                fontFamily:"Montserrat, sans-serif", 
                boxSizing:"border-box", 
                outline:"none",
                transition:"all 0.2s ease"
              }} 
              type="text" 
              value={user} 
              onChange={e=>{setUser(e.target.value);setError(false);}} 
              onKeyDown={e=>e.key==="Enter"&&handle()} 
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a5568", fontFamily:"Montserrat, sans-serif", marginBottom:8 }}>Password</label>
            <input 
              style={{ 
                width:"100%", 
                padding:"14px 16px", 
                borderRadius:10, 
                border:"1px solid #e2e8f0", 
                background:"#f7fafc", 
                color:"#2d3748", 
                fontSize:14, 
                fontFamily:"Montserrat, sans-serif", 
                boxSizing:"border-box", 
                outline:"none",
                transition:"all 0.2s ease"
              }} 
              type="password" 
              value={pass} 
              onChange={e=>{setPass(e.target.value);setError(false);}} 
              onKeyDown={e=>e.key==="Enter"&&handle()} 
              placeholder="Enter your password"
            />
          </div>
        </div>

        {/* Login Button */}
        <button 
          style={{ 
            width:"100%", 
            padding:"16px 0", 
            background:loading ? "#B8943D" : "#C9A84C",
            color:"#ffffff", 
            border:"none", 
            borderRadius:10, 
            fontFamily:"Montserrat, sans-serif", 
            fontWeight:600, 
            fontSize:16, 
            cursor:"pointer", 
            opacity:loading?0.7:1,
            transition:"all 0.2s ease",
            boxShadow:"0 4px 15px rgba(201, 168, 76, 0.4)"
          }} 
          onClick={handle}
          onMouseEnter={e=>!loading && (e.target.style.background="#B8943D")}
          onMouseLeave={e=>!loading && (e.target.style.background="#C9A84C")}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
