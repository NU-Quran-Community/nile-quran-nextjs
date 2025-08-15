"use client";
import { styled } from "@/styled-system/jsx";
import { useMeasure } from "@uidotdev/usehooks";
import { AnimatePresence, motion, Variant, Variants } from "motion/react";
import { Tajawal } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

const tajawl = Tajawal({
  weight: "800",
});

const tabs = {
  login: { value: "تسجيل الدخول", path: "/auth/login" },
  register: { value: "انشاء حساب", path: "/auth/register" },
} as const;
type Tab = keyof typeof tabs;

function AuthCard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initialTab = pathname.split("/").slice(-1)[0] as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [elementRef, { height }] = useMeasure();

  const tabsLength = Object.keys(tabs).length;
  const variantsArray: Variant[] = Object.keys(tabs).map((_, index) => {
    const right = (tabsLength - index - 1) * (100 / tabsLength);
    const left = index * (100 / tabsLength);
    return {
      clipPath: `inset(0 ${left}% 0 ${right}%)`,
    };
  });

  const variants: Variants = Object.fromEntries(
    variantsArray.map((variant, index) => [index, variant])
  );

  const tabContentVariants: Variants = {
    initial: (direction) => ({
      opacity: 0,
      x: `${direction * -110}%`,
      filter: "blur(25px)",
    }),
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (direction) => ({
      opacity: 0,
      x: `${direction * 110}%`,
      filter: "blur(25px)",
    }),
  };

  useEffect(() => {
    const currentIndex = Object.keys(tabs).indexOf(activeTab);
    setDirection(currentIndex == 1 ? 1 : -1);
  }, [activeTab]);

  useEffect(() => {
    const initialTab = pathname.split("/").slice(-1)[0] as Tab;
    setActiveTab(initialTab);
  }, [pathname]);

  return (
    <Wrapper>
      <Tabs className={tajawl.className}>
        {Object.keys(tabs).map((tab) => (
          <Tab
            key={tab}
            name={tab as Tab}
            path={tabs[tab as Tab].path}
            setActiveTab={setActiveTab}
          >
            {tabs[tab as Tab].value}
          </Tab>
        ))}
      </Tabs>

      <OverlayTabs
        initial={String(Object.keys(tabs).indexOf(activeTab))}
        variants={variants}
        animate={String(Object.keys(tabs).indexOf(activeTab))}
        transition={{ duration: 0.6, bounce: 0.1, type: "spring" }}
        className={tajawl.className}
      >
        {Object.keys(tabs).map((tab) => (
          <Tab
            active
            key={tab}
            name={tab as Tab}
            path={tabs[tab as Tab].path}
            setActiveTab={setActiveTab}
          >
            {tabs[tab as Tab].value}
          </Tab>
        ))}
      </OverlayTabs>

      <motion.div
        animate={{ height: height as number }}
        transition={{ duration: 0.5 }}
        layout
      >
        <div ref={elementRef}>
          <AnimatePresence mode="popLayout" initial={false}>
            <Body
              key={activeTab}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, type: "spring", bounce: 0.05 }}
              custom={direction}
            >
              {children}
            </Body>
          </AnimatePresence>
        </div>
      </motion.div>
    </Wrapper>
  );
}

const Tab = ({
  children,
  path,
  active = false,
}: {
  children: ReactNode;
  name: Tab;
  path: string;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  active?: boolean;
}) => {
  return (
    <TabItem href={path} className={active ? "active" : ""}>
      {children}
    </TabItem>
  );
};

const Wrapper = styled.div`
  position: relative;
  background: #f7fbea;
  width: 100%;
  max-width: 900px;
  border: var(--sherwood) solid 1px;
  border-radius: 16px;
  overflow: hidden;
`;
const Tabs = styled(motion.ul)`
  display: flex;
  list-style: none;
  * {
    font-weight: 800;
  }
`;
const OverlayTabs = styled(Tabs)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;
const TabItem = styled(Link)`
  flex: 1;
  padding: 25px 0;
  text-align: center;

  background: #ebffbd;
  border-bottom: 1px solid var(--sherwood);
  &:first-child {
    border-left: 1px solid var(--sherwood);
  }

  cursor: pointer;
  &:hover {
    background: var(--slimeGreen);
  }

  &.active {
    background: var(--sherwood);
    color: var(--slimeGreen) !important;
    &:hover {
      background: var(--sherwood);
      /* opacity: 0.95; */
    }
  }

  transition: background 0.2s ease;
`;

const Body = styled(motion.div)`
  padding: 30px 36px;
`;

export default AuthCard;
