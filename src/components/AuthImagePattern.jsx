import BackgroundImg from "../assets/images/background.jpg";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="items-center justify-center hidden p-12 lg:flex bg-base-200">
      <div className="max-w-md pt-10 text-center">
        <img
          src={BackgroundImg}
          className="w-full shadow-md rounded-xl"
          alt="background"
        />
        <h2 className="mt-10 mb-4 text-2xl font-bold">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
