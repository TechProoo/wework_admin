import React, { createContext, useContext, useState } from "react";
import NewCourseModal from "../components/NewCourseModal";

type OpenPayload = Partial<{ title: string; category: string; level: string }>;

type NewCourseContextValue = {
  open: (payload?: OpenPayload) => void;
};

const NewCourseContext = createContext<NewCourseContextValue | null>(null);

export function NewCourseProvider({ children }: { children: React.ReactNode }) {
  const [openState, setOpenState] = useState<OpenPayload | null>(null);

  const open = (payload?: OpenPayload) => setOpenState(payload ?? {});
  const close = () => setOpenState(null);

  return (
    <NewCourseContext.Provider value={{ open }}>
      {children}
      <NewCourseModal initial={openState} onClose={close} />
    </NewCourseContext.Provider>
  );
}

export function useNewCourse() {
  const ctx = useContext(NewCourseContext);
  if (!ctx)
    throw new Error("useNewCourse must be used within NewCourseProvider");
  return ctx;
}

export default NewCourseContext;
