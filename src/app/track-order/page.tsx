import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import TrackOrderContent from './TrackOrderContent';

export default function TrackOrderPage() {
  return (
    <>
      <Header variant="inner" />
      <TrackOrderContent />
      <Footer />
      <CartSidebar />
    </>
  );
}
