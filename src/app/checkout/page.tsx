import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutContent from './CheckoutContent';

export default function CheckoutPage() {
  return (
    <>
      <Header variant="inner" />
      <CheckoutContent />
      <Footer />
      <CartSidebar />
    </>
  );
}

