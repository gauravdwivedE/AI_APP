import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useContext } from "react";
import { LoginContext } from "../context/LoginProvider";

export default function Login() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { token, login, logout, isLoggedIn } = useContext(LoginContext);
  
  const navigate = useNavigate();
 
  const onSubmit = async (data) => {
  try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        data,
        { withCredentials: true }
      );

      if(res.status == 200){
        login(res.data.token)
        toast.success("Login successful 🎉");
        navigate("/");
        
      }
    } catch (err) {
      login("")
      
      // Show API/server error inside toast
      const message = err.response?.data?.error || "Something went wrong. Try again.";
      toast.error(message);
    }
    finally{
      reset()
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-white text-3xl font-bold text-center mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div>
            <label className="text-neutral-300 text-sm">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email required" })}
              className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20 text-white focus:ring focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-neutral-300 text-sm">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20 text-white focus:ring focus:ring-indigo-500"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 transition rounded-xl text-white font-medium">
            Login
          </button>
        </form>

        <p className="text-center text-neutral-400 text-sm mt-4">
          New here?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
