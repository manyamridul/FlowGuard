const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-400 sm:flex-row sm:text-left sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Flow Guard. All rights reserved.</p>
        <p>Intelligent Project Workflow &amp; Bug Management System</p>
      </div>
    </footer>
  );
};

export default Footer;
