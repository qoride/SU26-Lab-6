import { useState } from "react";

function Login(){
    const [loginFormData,setLoginFormData] = useState("{username: '', password: ''}")

    const loginSubmit = () => {
        alert(loginFormData.username);
        // will use axios or fetch
    }

    return (
        <div className="loginBox">
            <h1>ACME University Login</h1>

            <form onSubmit={loginSubmit}>
                <p>Username</p>
                <input id="username" name="username" type="text" placeholder="Username" 
                value={loginFormData.username} 
                onChange={(e)=>setLoginFormData((x)=>({...x, username:e.target.value}))}
                required />

                <p>Password</p>
                <input type="password" id="password" name="password" placeholder="Password"
                value={loginFormData.password} 
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



