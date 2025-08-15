import { styled } from "@/styled-system/jsx";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Wrapper>
      <Label>{props.name}</Label>
      <InputElement placeholder={props.name} {...props} />
    </Wrapper>
  );
};

const Wrapper = styled.div``;
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--sherwood);
  font-size: 16px;
  font-weight: 600;
`;

const InputElement = styled.input`
  width: 100%;
  padding: 20px 16px;
  border: 1px solid var(--sherwood);
  border-radius: 8px;
  background-color: #fff;
  color: var(--sherwood);
  font-size: 18px;

  &:focus {
    outline: var(--slimeGreen) solid 2px;
    outline-offset: 2px;
    /* border: var(--slimeGreen) solid 2px;
    box-shadow: 0 0 0 2px rgba(0, 128, 0, 0.2); */
  }

  &::placeholder {
    color: #707f7b;
    opacity: 0.7;
    font-weight: 300;
  }
`;

export default Input;
