// ✅ FIX BUG #1: /portal/parent/journal was missing — caused 404
// This re-exports the parent dashboard which contains the full journal view
export { default } from "../page";
