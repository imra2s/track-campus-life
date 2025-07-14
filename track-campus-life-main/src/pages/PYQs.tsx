
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileQuestion, Download, Upload, Search } from 'lucide-react';
import { toast } from 'sonner';

interface PYQ {
  id: string;
  title: string;
  subject: string;
  year: number;
  semester: number;
  file_name: string;
  file_path: string;
  created_at: string;
}

const PYQs = () => {
  const { user } = useAuth();
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [filteredPyqs, setFilteredPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    fetchPYQs();
  }, []);

  useEffect(() => {
    filterPYQs();
  }, [pyqs, searchTerm, selectedYear, selectedSemester]);

  const fetchPYQs = async () => {
    try {
      const { data, error } = await supabase
        .from('pyqs')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setPyqs(data || []);
    } catch (error) {
      console.error('Error fetching PYQs:', error);
      toast.error('Failed to load PYQs');
    } finally {
      setLoading(false);
    }
  };

  const filterPYQs = () => {
    let filtered = pyqs;

    if (searchTerm) {
      filtered = filtered.filter(
        (pyq) =>
          pyq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pyq.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedYear && selectedYear !== 'all') {
      filtered = filtered.filter((pyq) => pyq.year.toString() === selectedYear);
    }

    if (selectedSemester && selectedSemester !== 'all') {
      filtered = filtered.filter((pyq) => pyq.semester.toString() === selectedSemester);
    }

    setFilteredPyqs(filtered);
  };

  const getUniqueYears = () => {
    const years = [...new Set(pyqs.map((pyq) => pyq.year))];
    return years.sort((a, b) => b - a);
  };

  const getUniqueSemesters = () => {
    const semesters = [...new Set(pyqs.map((pyq) => pyq.semester))];
    return semesters.sort((a, b) => a - b);
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
          <h1 className="text-3xl font-bold">Previous Year Questions</h1>
          <p className="text-muted-foreground">
            Access previous year question papers for exam preparation
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload PYQ
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {getUniqueYears().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {getUniqueSemesters().map((semester) => (
              <SelectItem key={semester} value={semester.toString()}>
                Semester {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPyqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {pyqs.length === 0 ? 'No PYQs available' : 'No results found'}
            </h3>
            <p className="text-muted-foreground text-center">
              {pyqs.length === 0
                ? 'Previous year question papers will appear here once they are uploaded.'
                : 'Try adjusting your search criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPyqs.map((pyq) => (
            <Card key={pyq.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{pyq.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {pyq.subject}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {pyq.year}
                    </Badge>
                    <Badge variant="secondary">
                      Sem {pyq.semester}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileQuestion className="h-4 w-4" />
                    {pyq.file_name}
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

export default PYQs;
