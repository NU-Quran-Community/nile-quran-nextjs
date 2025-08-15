import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { styled } from "@/styled-system/jsx";

const Register = () => {
  return (
    <Wrapper>
      <Input type="text" name="الاسم كامل" />
      <Input type="email" name="البريد الالكترونى" />
      <Input type="text" name="اسم المستخدم" />
      <Input type="passwrod" name="كلمة السر" />
      <Button type="submit">إنشاء حساب</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;
export default Register;
