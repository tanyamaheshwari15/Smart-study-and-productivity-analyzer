export const Signup= () => {
    return (
        <> 
        <h1>Signup Page</h1>
        <form action="dashboard.jsx" method="get">
            <input placeholder="Name" /><br />
            <input placeholder="Email" /><br />
            <input placeholder="Password" /><br />
            <input placeholder="Confirm Password" /><br />
            <button>Create Account</button>
        </form>
        </>
    )
}