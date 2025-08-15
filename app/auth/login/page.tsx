import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { styled } from "@/styled-system/jsx";

const Login = () => {
  return (
    <Wrapper>
      <Input type="text" name="اسم المستخدم" />
      <Input type="email" name="كلمة السر" />
      <Button type="submit"> تسجيل الدخول</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export default Login;
