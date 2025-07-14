import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-2xl mx-auto text-center p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <GraduationCap className="h-16 w-16 text-primary" />
          <h1 className="text-5xl font-bold text-gradient-primary">CampusTrack</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Your complete student portal for managing attendance, syllabus, PYQs, and more.
        </p>
        <Button size="lg" className="button-glow" asChild>
          <a href="/auth">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Index;
