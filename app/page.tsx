import { styled } from "../styled-system/jsx";

export default function Home() {
  return (
    <Wrapper>
      <Head></Head>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background-color: #f00;
  height: 50px;
`;

const Head = styled.h1`
  color: #00f;
`;
