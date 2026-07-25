import { Container } from "@/components/Container/Container";

import styles from "./AboutService.module.css";
import { SectionHeader } from "./SectionHeader";

export function AboutService() {
  return (
    <Container>
   <section className={styles.aboutServiceSection}>
    <div className={styles.left}>
        <SectionHeader
  badge="О СЕРВИСЕ"
  titleStyle={{marginTop: '10px'}}
  
> 

<>
Выгодный обмен <br /> без посредников и <br /> ожидания 
</>
</SectionHeader>
        
    </div>
    <div className={styles.right}>
        <p>
            ONLYp2p соединяет продавцов криптовалюты и плательщиков напрямую. Ты пополняешь баланс криптой и получаешь рубли по курсу +7% к бирже, а затем принимаешь входящие переводы на свою карту или СБП.
        <br />
        <br />
Никаких форм вывода и долгих проверок: система автоматически мэтчит покупателей, а ты подтверждаешь получение в один тап. Прозрачные параметры, честный курс, никаких скрытых комиссий.
        </p>
    </div>
   </section>
    </Container>
  );
}
