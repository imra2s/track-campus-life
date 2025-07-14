
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  BookOpen,
  Loader2
} from 'lucide-react';

const AdminUploads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  // Syllabus form state
  const [syllabusTitle, setSyllabusTitle] = useState('');
  const [syllabusSubject, setSyllabusSubject] = useState('');
  const [syllabusSemester, setSyllabusSemester] = useState('1');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  
  // PYQ form state
  const [pyqTitle, setPyqTitle] = useState('');
  const [pyqSubject, setPyqSubject] = useState('');
  const [pyqYear, setPyqYear] = useState(new Date().getFullYear().toString());
  const [pyqSemester, setPyqSemester] = useState('1');
  const [pyqFile, setPyqFile] = useState<File | null>(null);

  const uploadSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !syllabusFile) return;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = syllabusFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `syllabus/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('syllabus')
        .upload(filePath, syllabusFile);

      if (uploadError) throw uploadError;

      // Save record to database
      const { error: dbError } = await supabase
        .from('syllabus')
        .insert({
          title: syllabusTitle,
          subject: syllabusSubject,
          semester: parseInt(syllabusSemester),
          file_name: syllabusFile.name,
          file_path: filePath,
          uploaded_by: user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Syllabus uploaded successfully",
      });

      // Reset form
      setSyllabusTitle('');
      setSyllabusSubject('');
      setSyllabusSemester('1');
      setSyllabusFile(null);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadPYQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pyqFile) return;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = pyqFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `pyqs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pyqs')
        .upload(filePath, pyqFile);

      if (uploadError) throw uploadError;

      // Save record to database
      const { error: dbError } = await supabase
        .from('pyqs')
        .insert({
          title: pyqTitle,
          subject: pyqSubject,
          year: parseInt(pyqYear),
          semester: parseInt(pyqSemester),
          file_name: pyqFile.name,
          file_path: filePath,
          uploaded_by: user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "PYQ uploaded successfully",
      });

      // Reset form
      setPyqTitle('');
      setPyqSubject('');
      setPyqYear(new Date().getFullYear().toString());
      setPyqSemester('1');
      setPyqFile(null);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Uploads</h1>
        <p className="text-muted-foreground">
          Upload syllabus files and previous year question papers
        </p>
      </div>

      <Tabs defaultValue="syllabus" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="pyqs">PYQs</TabsTrigger>
        </TabsList>

        <TabsContent value="syllabus">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Upload Syllabus
              </CardTitle>
              <CardDescription>
                Upload syllabus files for different subjects and semesters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={uploadSyllabus} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="syllabus-title">Title</Label>
                    <Input
                      id="syllabus-title"
                      placeholder="e.g., Data Structures Syllabus"
                      value={syllabusTitle}
                      onChange={(e) => setSyllabusTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="syllabus-subject">Subject</Label>
                    <Input
                      id="syllabus-subject"
                      placeholder="e.g., Data Structures"
                      value={syllabusSubject}
                      onChange={(e) => setSyllabusSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={syllabusSemester} onValueChange={setSyllabusSemester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syllabus-file">File</Label>
                  <Input
                    id="syllabus-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX
                  </p>
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Syllabus
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pyqs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload PYQs
              </CardTitle>
              <CardDescription>
                Upload previous year question papers for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={uploadPYQ} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pyq-title">Title</Label>
                    <Input
                      id="pyq-title"
                      placeholder="e.g., Data Structures Mid-term"
                      value={pyqTitle}
                      onChange={(e) => setPyqTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pyq-subject">Subject</Label>
                    <Input
                      id="pyq-subject"
                      placeholder="e.g., Data Structures"
                      value={pyqSubject}
                      onChange={(e) => setPyqSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pyq-year">Year</Label>
                    <Input
                      id="pyq-year"
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={pyqYear}
                      onChange={(e) => setPyqYear(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={pyqSemester} onValueChange={setPyqSemester}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pyq-file">File</Label>
                  <Input
                    id="pyq-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setPyqFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX
                  </p>
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload PYQ
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUploads;
