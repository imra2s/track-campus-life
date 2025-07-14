
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface SyllabusItem {
  id: string;
  title: string;
  subject: string;
  semester: number;
  file_name: string;
  file_path: string;
  created_at: string;
}

const Syllabus = () => {
  const { user } = useAuth();
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      const { data, error } = await supabase
        .from('syllabus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSyllabusItems(data || []);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      toast.error('Failed to load syllabus');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Syllabus</h1>
          <p className="text-muted-foreground">
            Access course syllabi and curriculum documents
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Syllabus
        </Button>
      </div>

      {syllabusItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No syllabus available</h3>
            <p className="text-muted-foreground text-center">
              Syllabus documents will appear here once they are uploaded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {syllabusItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {item.subject}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Semester {item.semester}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {item.file_name}
                  </div>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Syllabus;
