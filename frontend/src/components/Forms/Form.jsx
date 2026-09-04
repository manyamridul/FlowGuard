const Form = ({ title = "Form" }) => {
  return (
    <form className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Field</label>
        <input
          type="text"
          placeholder="Enter value"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          readOnly
        />
      </div>
    </form>
  );
};

export default Form;
