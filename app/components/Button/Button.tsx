import { styled } from "@/styled-system/jsx";

const Button = styled.button`
  padding: 16px 24px;
  background-color: var(--slimeGreen);
  color: var(--sherwood);
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #a0db17;
  }
`;

export default Button;
