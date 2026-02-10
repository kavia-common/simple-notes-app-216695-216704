import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Simple Notes header", () => {
  render(<App />);
  const title = screen.getByText(/simple notes/i);
  expect(title).toBeInTheDocument();
});
