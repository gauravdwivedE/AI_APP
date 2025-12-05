import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register, handleSubmit, formState: { errors }} = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
        data.fullName = {firstName: data.firstName, lastName: data.lastName}
        delete data.firstName;
        delete data.lastName;
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        data,
        { withCredentials: true }
      );

      if(res.status == 201){
        toast.success("Account created 🎉");
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.error || "Something went wrong. Try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-xl">
        
        <h1 className="text-white text-3xl font-bold text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* 🔥 FIRST + LAST NAME (2 columns) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-300 text-sm">First Name</label>
              <input
                {...register("firstName", { required: "First name required" })}
                className="w-full p-3 mt-1 bg-white/10 border border-white/20 rounded-xl text-white focus:ring focus:ring-indigo-500"
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="text-neutral-300 text-sm">Last Name</label>
              <input
                {...register("lastName", { required: "Last name required" })}
                className="w-full p-3 mt-1 bg-white/10 border border-white/20 rounded-xl text-white focus:ring focus:ring-indigo-500"
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-neutral-300 text-sm">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email required" })}
              className="w-full p-3 mt-1 bg-white/10 border border-white/20 rounded-xl text-white focus:ring focus:ring-indigo-500"
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
              className="w-full p-3 mt-1 bg-white/10 border border-white/20 rounded-xl text-white focus:ring focus:ring-indigo-500"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 transition rounded-xl text-white font-medium">
            Register
          </button>
        </form>

        <p className="text-center text-neutral-400 text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
