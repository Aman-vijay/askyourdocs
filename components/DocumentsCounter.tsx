import React from "react";

const DocumentsCounter: React.FC<{ count: number }> = ({ count }) => (
  <div className="border-t border-gray-800 pt-4">
    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
      <span>Documents</span>
      <span className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-medium">
        {count}
      </span>
      {/* <span className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-medium">
        {documentNames.join(", ") || "No documents"}
      </span> */}
    </h3>
    {count === 0 ? (
      <p className="text-xs text-gray-500">No documents uploaded yet</p>
    ) : (
      <p className="text-[11px] text-gray-500">
        Indexed documents ready for questions.
      </p>
    )}
  </div>
);

export default DocumentsCounter;
