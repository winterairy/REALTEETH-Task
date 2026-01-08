import { type ReactElement } from "react";
import { SearchBar } from "./SearchBar";

export const HomePage = (): ReactElement => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <SearchBar />
      </div>
    </div>
  );
};
