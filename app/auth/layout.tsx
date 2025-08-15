import { styled } from "@/styled-system/jsx";
import { Lalezar } from "next/font/google";
import { ReactNode } from "react";
import AuthCard from "../components/AuthCard";

const lalezar = Lalezar({
  weight: "400",
});

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Wrapper>
      <SideImage></SideImage>
      <Content>
        <Heading className={lalezar.className}>قرآن النيل</Heading>
        <AuthCard>{children}</AuthCard>
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: stretch;
  gap: 2rem;
`;

const SideImage = styled.div`
  width: 100%;
  flex: 1;
  background-image: url("/abstract.svg");
  background-size: cover;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Content = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
`;

const Heading = styled.h1`
  font-size: 54px;
`;

export default AuthLayout;
