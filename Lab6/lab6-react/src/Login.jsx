import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){
    
    const [loginFormData,setLoginFormData] = useState("{username: '', password: ''}");
    const [logInErrMsg,setLogInErrMsg] = useState("");
    const navigate = useNavigate();

    const loginSubmit = (e) => {
        e.preventDefault();
        localStorage.clear();
        if (!loginFormData.username.trim() || !loginFormData.password.trim()){
            setLogInErrMsg("Please Enter A Vaild Username And Password");
            return;
        }
        setLogInErrMsg("");
        loginUser(loginFormData.username, loginFormData.password);
        return setLoginFormData("{username: '', password: ''}");
    }

    async function loginUser(username, password){
        //alert(username);

        try {
          const response = await fetch("http://localhost:8000/login", {
                              method: "POST",
                              headers: {
                                'Content-Type': 'application/json',
                                Accept: "application/json",
                              },
                              body: JSON.stringify({username,password}),
                              credentials: "include",
                            });
          //alert(response.ok);
          if(!response.ok){
              localStorage.clear();
              window.location.href = "/login";
              return;
          }
          const result = await response.json();
          //alert(result);

          if(result.success){
            //alert(result.success);
            // const user = {username: result.name, role: result.role};
            
            // localStorage.setItem("user", JSON.stringify(user));
            // // alert(JSON.parse(localStorage.getItem["user"]).role);

            localStorage.setItem("name", result.name);
            localStorage.setItem("role",result.role);
            // alert(localStorage.getItem["name"]);
          }else{
            //alert("in else");
            localStorage.clear();
            setLogInErrMsg(result.error);
            return;
          }

          if(result.role==="student"){
            navigate("/student");
          }else if(result.role==="teacher"){
            navigate("/teacher");
          }

        } catch (err) {
            localStorage.clear();
            setLogInErrMsg(err.message || "An error occurred");
        }
    }

    return (
        <div className="loginBox">
            <h1>ACME University Login</h1>

            {logInErrMsg && (<div className="loginError">{logInErrMsg}</div>)}

            <form onSubmit={loginSubmit}>
                <p>Username</p>
                <input id="username" name="username" type="text" placeholder="Username" 
                value={loginFormData.username || ""} 
                onChange={(e)=>setLoginFormData((x)=>({...x, username:e.target.value}))}
                required />

                <p>Password</p>
                <input type="password" id="password" name="password" placeholder="Password"
                value={loginFormData.password || ""} 
                onChange={(e)=>setLoginFormData((x)=>({...x, password:e.target.value}))}
                required />
        
                <button type="submit">Sign in</button>
            </form>

            <div className="hintBox">
                <p>Hint for testing:</p>
                <p>Student Login: cnorris / 123</p>
                <p>Teacher Login: ahepworth / 123</p>
            </div>
        </div>
    )
}

export default Login



