
import { MetricsGrid } from "@/components/dashboard/MetricsGrid"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { CustomerChart } from "@/components/dashboard/CustomerChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { HourlyChart } from "@/components/dashboard/HourlyChart"
import { StockChart } from "@/components/dashboard/StockChart"
import { InsightsPanel } from "@/components/InsightsPanel"
import { IntegrationsPanel } from "@/components/integrations/IntegrationsPanel"
import { useMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

export default function Index() {
  const isMobile = useMobile();
  
  // Configurações de animação para os componentes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="container py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <MetricsGrid />
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <SalesChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CustomerChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <CategoryChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <HourlyChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <StockChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <IntegrationsPanel />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <InsightsPanel />
      </motion.div>
    </motion.div>
  )
}
